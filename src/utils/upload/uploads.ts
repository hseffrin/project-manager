// Shared between the upload route (server) and the dropzone (client),
// so the limit checked in the browser is the same one enforced by the token.

// Development files go to test/ so they never mix with production files in
// the same Blob store. NODE_ENV is inlined in the client bundle by Next.js:
// "development" under `next dev`, "production" in any build.
const BLOB_ROOT = process.env.NODE_ENV === "production" ? "" : "test/";
// The browser uploads covers here. Saving the project moves the cover to
// the project's folder (projectCoverPath).
const TEMP_UPLOAD_PREFIX = `${BLOB_ROOT}tmp/`;
const PROJECT_COVERS_PREFIX = `${BLOB_ROOT}projects/`;
const MAX_UPLOAD_BYTES = 1024 * 1024; // 1 MB
// Uploads are project covers: only .jpg and .png images, as the form says.
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png"];

// projects/<public_id>/<file name>: each project keeps its cover in its own
// folder.
const projectCoverPath = (publicId: string, fileName: string): string =>
  `${PROJECT_COVERS_PREFIX}${publicId}/${fileName}`;

export {
  ALLOWED_CONTENT_TYPES,
  BLOB_ROOT,
  MAX_UPLOAD_BYTES,
  PROJECT_COVERS_PREFIX,
  TEMP_UPLOAD_PREFIX,
  projectCoverPath,
};
