// components/ui/Button.js
import React from 'react';

export function Button({ className = '', children, ...props }) {
  return (
    <button
      className={`bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
