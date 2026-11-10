declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    AUTH_MODE?: 'sites'|'supabase';
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    BUCKET?: R2Bucket;
    OURA_CLIENT_ID?: string;
    OURA_CLIENT_SECRET?: string;
    OURA_REDIRECT_URI?: string;
    OURA_TOKEN_ENCRYPTION_KEY?: string;
    OPENAI_API_KEY?: string;
    GEMINI_API_KEY?: string;
    GEMINI_MODEL?: string;
    OPENAI_MODEL?: string;
    OPENAI_IMAGE_MODEL?: string;
    PUSH_PUBLIC_KEY?: string;
    PUSH_PRIVATE_KEY?: string;
  }
}
