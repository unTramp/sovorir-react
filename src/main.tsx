// Polyfills for older browsers (Safari < 18.2, Chrome < 134)
declare global {
  interface Uint8Array {
    toHex(): string;
  }
  interface PromiseConstructor {
    try<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<Awaited<T>>;
  }
}

if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function () {
    let result = '';
    for (let i = 0; i < this.length; i++) {
      result += this[i].toString(16).padStart(2, '0');
    }
    return result;
  };
}

if (typeof Promise.try !== 'function') {
  Promise.try = function (fn: (...args: any[]) => any, ...args: any[]) {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
