import { useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, MapPin, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../../Store/UseChatStore.js";

const PRESET_MESSAGE = "I need emergency help. Please contact me as soon as possible.";

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This browser does not support location sharing."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      }),
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow access or turn off location sharing to send without it."
          : "Could not get your current location. Try again or turn off location sharing to send without it.";
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export function EmergencySos({ compact = false }) {
  const sendEmergencyAlert = useChatStore((state) => state.sendEmergencyAlert);
  const [isOpen, setIsOpen] = useState(false);
  const [messageType, setMessageType] = useState("preset");
  const [customMessage, setCustomMessage] = useState("");
  const [shareLocation, setShareLocation] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSending) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSending]);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = messageType === "preset" ? PRESET_MESSAGE : customMessage.trim();
    if (!text) {
      toast.error("Write a message before sending the SOS.");
      return;
    }

    setIsSending(true);
    try {
      const location = shareLocation ? await getCurrentLocation() : undefined;
      const result = await sendEmergencyAlert({ text, location });

      if (!result.sentCount) {
        toast.error("There are no other registered users to alert yet.");
        return;
      }

      toast.success(`SOS sent to ${result.sentCount} ${result.sentCount === 1 ? "person" : "people"}.`);
      setIsOpen(false);
      setCustomMessage("");
      setMessageType("preset");
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Could not send the SOS. Please try again.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-label="Send an SOS"
        title="Send an SOS"
        className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-red-600 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${compact ? "w-9 justify-center px-0" : "px-2.5 sm:px-3"}`}
      >
        <AlertTriangle className="size-4" aria-hidden="true" />
        {compact ? <span className="sr-only">SOS</span> : "SOS"}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-sos-title"
            aria-describedby="emergency-sos-description"
            className="my-auto w-full max-w-lg rounded-2xl border border-red-500/30 bg-background p-5 text-foreground shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-500">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="emergency-sos-title" className="text-lg font-bold">Send an SOS?</h2>
                <p id="emergency-sos-description" className="mt-1 text-sm leading-relaxed text-muted">
                  This alerts every other registered user in this app. It does not contact emergency services.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSending}
                aria-label="Close SOS dialog"
                className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-semibold">Choose your message</legend>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition has-[:checked]:border-red-500/60 has-[:checked]:bg-red-500/5">
                  <input
                    type="radio"
                    name="emergency-message-type"
                    value="preset"
                    checked={messageType === "preset"}
                    onChange={() => setMessageType("preset")}
                    className="accent-red-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">Emergency help message</span>
                    <span className="block text-xs text-muted">“{PRESET_MESSAGE}”</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition has-[:checked]:border-red-500/60 has-[:checked]:bg-red-500/5">
                  <input
                    type="radio"
                    name="emergency-message-type"
                    value="custom"
                    checked={messageType === "custom"}
                    onChange={() => setMessageType("custom")}
                    className="accent-red-600"
                  />
                  <span className="text-sm font-medium">Write a message to everyone</span>
                </label>
              </fieldset>

              {messageType === "custom" ? (
                <div className="mt-3">
                  <label htmlFor="emergency-custom-message" className="sr-only">Your emergency message</label>
                  <textarea
                    id="emergency-custom-message"
                    value={customMessage}
                    onChange={(event) => setCustomMessage(event.target.value.slice(0, 500))}
                    placeholder="Tell everyone what kind of help you need..."
                    rows={3}
                    maxLength={500}
                    autoFocus
                    required
                    className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-red-500/70 focus:ring-2 focus:ring-red-500/20"
                  />
                  <p className="mt-1 text-right text-xs text-muted">{customMessage.length}/500</p>
                </div>
              ) : null}

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
                <input
                  type="checkbox"
                  checked={shareLocation}
                  onChange={(event) => setShareLocation(event.target.checked)}
                  className="mt-0.5 size-4 accent-red-600"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="size-4 text-red-500" aria-hidden="true" />
                    Include my current location
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    Your coordinates will be shared with all recipients. Your browser may ask for location permission.
                  </span>
                </span>
              </label>

              <p className="mt-3 text-xs leading-relaxed text-muted">
                Online users receive an alert now. Others will see it when they next open the app.
              </p>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSending}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-surface disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || (messageType === "custom" && !customMessage.trim())}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
                  {isSending ? "Sending SOS…" : "Send SOS to everyone"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
