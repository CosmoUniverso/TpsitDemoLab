import { useState, useCallback } from 'react';
let _id = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'info', ms = 3500) => {
    const id = ++_id;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), ms);
  }, []);
  return {
    toasts,
    success: m => add(m, 'success'),
    error:   m => add(m, 'error', 4500),
    info:    m => add(m, 'info'),
  };
}
