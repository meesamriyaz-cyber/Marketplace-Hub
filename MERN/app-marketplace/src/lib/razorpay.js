const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loadPromise = null;

/**
 * Lazily injects the Razorpay Checkout script and resolves once it's ready.
 * Safe to call multiple times — the script is only ever added once.
 */
export function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${RAZORPAY_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = RAZORPAY_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return loadPromise;
}
