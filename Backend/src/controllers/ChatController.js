const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen3-30B-A3B:deepinfra";
const DEFAULT_LOCAL_MODEL = "qwen3:0.6b";
const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";
const MAX_MESSAGES = 24;
const MAX_MESSAGE_LENGTH = 4000;

export async function chatWithAssistant(req, res) {
  const incoming = req.body?.messages;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: "Send at least one message to the assistant." });
  }

  const messages = incoming.slice(-MAX_MESSAGES).map((message) => ({
    role: message?.role === "assistant" ? "assistant" : "user",
    content: typeof message?.content === "string" ? message.content.trim().slice(0, MAX_MESSAGE_LENGTH) : "",
  })).filter((message) => message.content);

  if (messages.length === 0 || messages.at(-1).role !== "user") {
    return res.status(400).json({ error: "Your latest message must be a non-empty user message." });
  }

  const provider = (process.env.AI_PROVIDER || "ollama").trim().toLowerCase();
  const systemMessage = {
    role: "system",
    content: "You are Qwen, a helpful, clear, and friendly assistant inside a chat application. Reply in the language the user uses. Keep answers concise unless detail is requested.",
  };

  try {
    let upstream;
    let result;

    if (provider === "ollama") {
      const ollamaUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL).replace(/\/+$/, "");
      upstream = await fetch(`${ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || DEFAULT_LOCAL_MODEL,
          messages: [systemMessage, ...messages],
          stream: false,
          options: { temperature: 0.7, num_predict: 700 },
        }),
        signal: AbortSignal.timeout(120000),
      });
      result = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        const missingModel = upstream.status === 404;
        return res.status(missingModel ? 503 : 502).json({
          error: missingModel
            ? `The local model is missing. Run: ollama pull ${process.env.OLLAMA_MODEL || DEFAULT_LOCAL_MODEL}`
            : "Ollama could not answer the request. Check that Ollama is running, then try again.",
        });
      }
      const reply = result?.message?.content;
      if (typeof reply !== "string" || !reply.trim()) {
        return res.status(502).json({ error: "Qwen returned an empty response. Please try again." });
      }
      return res.json({ reply: reply.trim() });
    }

    if (provider !== "huggingface") {
      return res.status(500).json({ error: "AI_PROVIDER must be set to 'ollama' or 'huggingface'." });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return res.status(503).json({ error: "Hugging Face is selected but HF_TOKEN is not configured." });
    }

    upstream = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.HF_MODEL || DEFAULT_MODEL,
        messages: [systemMessage, ...messages],
        max_tokens: 700,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000),
    });

    result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Hugging Face chat request failed:", upstream.status, result?.error || result?.message || "unknown error");
      const status = upstream.status === 402 ? 402
        : upstream.status === 401 || upstream.status === 403 ? 503
        : upstream.status === 429 ? 429
          : upstream.status >= 500 ? 503 : 502;
      const error = status === 402 ? "Hugging Face has no Inference Providers credits left for this account. Add prepaid credits or subscribe to PRO, then try again."
        : status === 429 ? "The AI is busy right now. Please try again shortly."
        : status === 503 ? "The AI service is unavailable. Check the Hugging Face token and model access, then try again."
          : "The assistant could not complete that request. Please try again.";
      return res.status(status).json({ error });
    }

    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "The assistant returned an empty response. Please try again." });
    }

    return res.json({ reply: reply.trim() });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    console.error(`${provider === "ollama" ? "Ollama" : "Hugging Face"} chat request error:`, error.message);
    return res.status(timedOut ? 504 : 503).json({
      error: timedOut
        ? "Qwen took too long to reply. Please try again."
        : provider === "ollama"
          ? `Cannot reach Ollama. Install/start Ollama and run: ollama pull ${process.env.OLLAMA_MODEL || DEFAULT_LOCAL_MODEL}`
          : "Could not connect to Hugging Face. Please try again shortly.",
    });
  }
}
