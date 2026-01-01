/**
 * Toast Notification Component
 * Displays temporary notification messages
 */

'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto remove after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const typeStyles = {
    success: 'bg-secondary-500 text-white',
    error: 'bg-warning-500 text-white',
    info: 'bg-info-500 text-white',
    warning: 'bg-primary-500 text-white',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div
      className={`${typeStyles[toast.type]} rounded-2xl shadow-lg p-4 flex items-center space-x-3 animate-slide-in`}
    >
      <span className="text-2xl">{icons[toast.type]}</span>
      <p className="flex-1 font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

// Helper functions
export const toast = {
  success: (message: string, duration?: number) => {
    useToast.getState().addToast({ message, type: 'success', duration });
  },
  error: (message: string, duration?: number) => {
    useToast.getState().addToast({ message, type: 'error', duration });
  },
  info: (message: string, duration?: number) => {
    useToast.getState().addToast({ message, type: 'info', duration });
  },
  warning: (message: string, duration?: number) => {
    useToast.getState().addToast({ message, type: 'warning', duration });
  },
};



