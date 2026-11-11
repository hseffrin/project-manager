import path from "node:path";

// Local stand-in for Vercel Blob, used when running on your machine.
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

// On Vercel the filesystem is read-only and not shared between instances,
// so local storage only makes sense outside of it.
const isLocalStorageAllowed = (): boolean => !process.env.VERCEL;

/** Resolves a storage key to an absolute path, or null if it escapes the upload dir. */
const resolveLocalPath = (key: string): string | null => {
  const fullPath = path.resolve(LOCAL_UPLOAD_DIR, key);
  return fullPath.startsWith(LOCAL_UPLOAD_DIR + path.sep) ? fullPath : null;
};

const sanitizeFilename = (name: string): string => {
  const base = path.basename(name).replace(/[^\w.-]+/g, "_");
  return base.replace(/^\.+/, "") || "file";
};

export {
  LOCAL_UPLOAD_DIR,
  isLocalStorageAllowed,
  resolveLocalPath,
  sanitizeFilename,
};
