import { CheckCircle, XCircle, Info } from 'lucide-react';
const icons = { success: <CheckCircle size={16}/>, error: <XCircle size={16}/>, info: <Info size={16}/> };
export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {icons[t.type]}{t.message}
        </div>
      ))}
    </div>
  );
}
