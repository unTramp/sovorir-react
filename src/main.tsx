// Polyfills for older browsers (Safari < 18.2, Chrome < 134)
declare global {
  interface Uint8Array {
    toHex(): string;
  }
  interface PromiseConstructor {
    try<T>(fn: (...args: unknown[]) => T, ...args: unknown[]): Promise<Awaited<T>>;
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
  Promise.try = function <T>(fn: (...args: unknown[]) => T, ...args: unknown[]) {
    return new Promise<Awaited<T>>((resolve) => resolve(fn(...args) as Awaited<T>));
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
