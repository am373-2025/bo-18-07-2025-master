/// <reference types="vite/client" />

declare global {
  interface Window {
    mediaBlobs?: Map<string, File>;
  }
}