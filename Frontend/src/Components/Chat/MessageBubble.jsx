import { withTransform } from "../../lib/imageKit.js";
import { MapPin, Siren } from "lucide-react";
import { MessageVideo } from "./MessageVideo.jsx";

// Compress + size images for the bubble (q-auto works for images; f-auto picks WebP/AVIF).
const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

export function MessageBubble({ message }) {
  const isOwnMessage = message.role === "me";
  const isEmergency = message.isEmergency;
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);
  const hasLocation = Number.isFinite(message.location?.latitude) && Number.isFinite(message.location?.longitude);
  const mapUrl = hasLocation
    ? `https://maps.google.com/?q=${message.location.latitude},${message.location.longitude}`
    : null;

  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(90%,28rem)] rounded-2xl px-3 py-2 text-[15px] leading-snug sm:max-w-[min(75%,28rem)] sm:px-3.5 ${
          isEmergency
            ? "border border-red-500/40 bg-red-950 text-red-50"
            : isOwnMessage
            ? "rounded-br-md bg-accent text-accent-foreground"
            : "rounded-bl-md bg-surface"
        }`}
      >
        {isEmergency ? (
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-red-300">
            <Siren className="size-3.5" aria-hidden="true" /> Emergency SOS
          </p>
        ) : null}
        {hasImage ? (
          <img
            src={withTransform(message.imageUrl, IMAGE_TRANSFORM)}
            alt=""
            className="mb-1.5 max-h-40 max-w-full rounded-lg object-cover sm:max-h-52 sm:rounded-xl"
          />
        ) : null}
        {hasVideo ? <MessageVideo src={message.videoUrl} /> : null}
        {message.text ? (
          <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
        ) : null}
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold underline-offset-2 hover:underline ${
              isEmergency ? "bg-red-900/70 text-red-100" : "bg-background/70 text-foreground"
            }`}
          >
            <MapPin className="size-3.5" aria-hidden="true" /> View shared location
          </a>
        ) : null}
        <p
          className={`mt-1 text-[11px] tabular-nums ${
            isEmergency ? "text-red-200/70" : isOwnMessage ? "text-accent-foreground/75" : "text-muted"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}
