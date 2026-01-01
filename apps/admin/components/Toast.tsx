/**
 * Toast notification component for admin panel
 */
export const toast = {
  success: (message: string): void => {
    if (typeof window !== 'undefined') {
      alert(message);
    }
  },
  error: (message: string): void => {
    if (typeof window !== 'undefined') {
      alert(`Error: ${message}`);
    }
  },
  info: (message: string): void => {
    if (typeof window !== 'undefined') {
      alert(message);
    }
  },
};

export function Toast({ message, type = 'info' }: { message: string; type?: 'success' | 'error' | 'info' }) {
  return (
    <div className={`p-4 rounded-lg ${
      type === 'success' ? 'bg-green-50 text-green-800' :
      type === 'error' ? 'bg-red-50 text-red-800' :
      'bg-blue-50 text-blue-800'
    }`}>
      {message}
    </div>
  );
}
