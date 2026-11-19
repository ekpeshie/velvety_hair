/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
  readonly VITE_ROUTER?: 'path' | 'hash';
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
