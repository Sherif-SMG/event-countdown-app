// components/ui/Input.js
import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`border rounded px-4 py-2 focus:outline-none focus:ring ${className}`}
      {...props}
    />
  );
}