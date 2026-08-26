export const APP_NAME = "iMessage";

export function AppLogo({ className = "", size = 32, alt = APP_NAME }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}favicon.svg`}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
