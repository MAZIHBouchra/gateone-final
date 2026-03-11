/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // ajoute ici d'autres variables si tu en as
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}