import { useCallback, useState } from "react";
import type { AppMessage, MessageType } from "../types/transaction";

const useCommon = () => {
  const [message, setMessage] = useState<AppMessage | null>(null);

  const showMessage = useCallback((type: MessageType, text: string) => {
    setMessage({ type, text });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    message,
    showMessage,
    clearMessage,
  };
};

export default useCommon;
