// Shared between the upload route (server) and the dropzone (client),
// so the limit checked in the browser is the same one enforced by the token.
export const UPLOAD_PREFIX = "projects/";
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB
