"use client";
import { PropsWithChildren } from 'react';

export default function Modal({ open, onClose, children, title }: PropsWithChildren<{ open: boolean; onClose: () => void; title?: string }>) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {title && <div className="modal-title">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}