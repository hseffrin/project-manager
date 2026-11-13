// Shared between the upload route (server) and the dropzone (client),
// so the limit checked in the browser is the same one enforced by the token.

// Development uploads go to test/ so they never mix with production files in
// the same Blob store. NODE_ENV is inlined in the client bundle by Next.js:
// "development" under `next dev`, "production" in any build.
const UPLOAD_PREFIX =
  process.env.NODE_ENV === "production" ? "projects/" : "test/projects/";
const MAX_UPLOAD_BYTES = 1024 * 1024; // 1 MB
// Uploads are project covers: only .jpg and .png images, as the form says.
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png"];

export { ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES, UPLOAD_PREFIX };
