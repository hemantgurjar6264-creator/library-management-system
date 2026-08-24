import React from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative bg-parchment-50 rounded-xl shadow-2xl w-full ${maxWidth} border border-ink-100 animate-[fadeIn_0.2s_ease-out]`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h3 className="font-display font-semibold text-lg text-ink-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-full p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
