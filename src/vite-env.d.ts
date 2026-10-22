/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_A11Y_FIXTURE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
