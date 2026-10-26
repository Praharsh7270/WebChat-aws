import { useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, Send, Sparkles, X } from "lucide-react";
import { axiosInstance } from "../../lib/axios.js";

const welcomeMessage = {
  role: "assistant",
  content: "Hi! I’m Qwen. Ask me anything, or get help writing a message.",
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [isOpen, messages, isSending]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage(event) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const userMessage = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setDraft("");
    setError("");
    setIsSending(true);

    try {
      const { data } = await axiosInstance.post("/chat", {
        messages: updatedMessages
          .filter((message) => message !== welcomeMessage)
          .map(({ role, content: messageContent }) => ({ role, content: messageContent })),
      });
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (requestError) {
      setMessages((current) => current.slice(0, -1));
      setDraft(content);
      setError(requestError.response?.data?.error || "Couldn’t reach Qwen. Please try again.");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function resetChat() {
    setMessages([welcomeMessage]);
    setDraft("");
    setError("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
      {isOpen && (
        <section
          aria-label="Chat with Qwen AI"
          className="mb-3 flex h-[min(72dvh,34rem)] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl"
        >
          <header className="flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-600 text-white">
              <Bot size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">Qwen Assistant</h2>
              <p className="text-xs text-muted">Powered by Hugging Face</p>
            </div>
            <button type="button" onClick={resetChat} className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-muted/15 hover:text-foreground" aria-label="Start a new chat">
              New chat
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-muted hover:bg-muted/15 hover:text-foreground" aria-label="Close Qwen chat">
              <X size={18} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-violet-600 text-white" : "rounded-bl-md bg-muted/15 text-foreground"}`}>
                  {message.content}
                </p>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-muted" role="status">
                <LoaderCircle size={15} className="animate-spin" /> Qwen is thinking…
              </div>
            )}
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600" role="alert">{error}</p>}
          </div>

          <form onSubmit={sendMessage} className="border-t border-border p-3">
            <label className="sr-only" htmlFor="qwen-message">Message Qwen</label>
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-violet-500">
              <textarea
                id="qwen-message"
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Ask Qwen anything…"
                className="max-h-28 min-h-9 flex-1 resize-y bg-transparent py-2 text-sm outline-none placeholder:text-muted"
                disabled={isSending}
              />
              <button type="submit" disabled={!draft.trim() || isSending} className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-45" aria-label="Send message">
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted">Enter to send · Shift+Enter for a new line</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="ml-auto flex items-center gap-2 rounded-full bg-violet-600 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close Qwen Assistant" : "Open Qwen Assistant"}
      >
        {isOpen ? <X size={19} /> : <><Sparkles size={18} /><span>Ask Qwen</span></>}
      </button>
    </div>
  );
}
