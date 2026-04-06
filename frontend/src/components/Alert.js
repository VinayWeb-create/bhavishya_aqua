import React, { useEffect, useState } from 'react';

export default function Alert({ type = 'info', message, onClose, autoClose = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoClose) return;
    const t = setTimeout(() => { setVisible(false); onClose && onClose(); }, autoClose);
    return () => clearTimeout(t);
  }, [autoClose, onClose]);

  if (!visible || !message) return null;

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  return (
    <div className={`alert alert-${type} fade-in`}>
      <span style={{ fontWeight: 700, fontSize: 16 }}>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => { setVisible(false); onClose && onClose(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: 16, lineHeight: 1 }}
      >✕</button>
    </div>
  );
}
