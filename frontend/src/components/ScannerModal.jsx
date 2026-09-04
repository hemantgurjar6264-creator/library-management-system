import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { X } from "lucide-react";

export default function ScannerModal({ isOpen, onClose, onScan }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          onScan(decodedText);
          onClose();
        },
        (error) => {
          // ignore parsing errors as they happen constantly until a code is found
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-card w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-ink-800">Scan Barcode / QR Code</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:bg-parchment-200 hover:text-ink-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          <div id="reader" className="w-full"></div>
          <p className="text-xs text-ink-400 text-center mt-4">Point your camera at the barcode or QR code.</p>
        </div>
      </div>
    </div>
  );
}
