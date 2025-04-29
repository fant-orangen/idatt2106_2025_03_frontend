// Polyfill for sockjs-client which expects 'global'
if (typeof window !== 'undefined') {
  (window as any).global = window;
}

export {};
