if (typeof Uint8Array.prototype.toHex !== 'function') {
  Uint8Array.prototype.toHex = function () {
    let result = '';
    for (let i = 0; i < this.length; i++) {
      result += this[i].toString(16).padStart(2, '0');
    }
    return result;
  };
}

if (typeof Promise.try !== 'function') {
  Promise.try = function (fn, ...args) {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}

await import('./pdf.worker.min.mjs');
