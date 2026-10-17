import type { AppMessage } from "../types/transaction";

type MessageBannerProps = {
  message: AppMessage | null;
  onDismiss: () => void;
};

const MessageBanner = ({ message, onDismiss }: MessageBannerProps) => {
  if (!message) {
    return null;
  }

  const isError = message.type === "error";

  return (
    <div
      className={`message-banner message-banner-${message.type}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}>
      <span>{message.text}</span>
      <button
        type="button"
        className="message-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss message">
        x
      </button>
    </div>
  );
};

export default MessageBanner;
