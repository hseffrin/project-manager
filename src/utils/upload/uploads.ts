// Shared between the upload route (server) and the dropzone (client),
// so the limit checked in the browser is the same one enforced by the token.
const UPLOAD_PREFIX = "projects/";
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

export { MAX_UPLOAD_BYTES, UPLOAD_PREFIX };
