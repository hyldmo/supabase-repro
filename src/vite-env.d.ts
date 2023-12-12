/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_API_KEY: string
	readonly VITE_SUPABASE_API_URL: string

	// Ensure env vars that are not defined cannot be used
	[key: string]: unknown
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
