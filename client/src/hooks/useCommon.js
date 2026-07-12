import { useCallback, useState } from "react";

const useCommon = () => {
  const [message, setMessage] = useState(null);

  const showMessage = useCallback((type, text) => {
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
