// components/ui/Card.js
import React from 'react';

export function Card({ className = '', children }) {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children }) {
  return (
    <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
  );
}

export function CardContent({ className = '', children }) {
  return (
    <div className={className}>{children}</div>
  );
}
