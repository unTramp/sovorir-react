// Polyfill: Uint8Array.prototype.toHex (Chrome < 134)
declare global {
  interface Uint8Array {
    toHex(): string;
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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
