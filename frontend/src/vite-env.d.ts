/// <reference types="vite/client" />

// Buffer global tanımlaması
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

export {};
