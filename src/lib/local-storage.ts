import path from "node:path";

// Local stand-in for Vercel Blob, used when running on your machine.
export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

// On Vercel the filesystem is read-only and not shared between instances,
// so local storage only makes sense outside of it.
export function isLocalStorageAllowed() {
  return !process.env.VERCEL;
}

/** Resolves a storage key to an absolute path, or null if it escapes the upload dir. */
export function resolveLocalPath(key: string) {
  const fullPath = path.resolve(LOCAL_UPLOAD_DIR, key);
  return fullPath.startsWith(LOCAL_UPLOAD_DIR + path.sep) ? fullPath : null;
}

export function sanitizeFilename(name: string) {
  const base = path.basename(name).replace(/[^\w.-]+/g, "_");
  return base.replace(/^\.+/, "") || "file";
}
