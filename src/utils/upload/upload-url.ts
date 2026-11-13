import { PROJECT_COVERS_PREFIX, TEMP_UPLOAD_PREFIX } from "./uploads";

// Server-only: the form sends the uploaded file URL as plain text, so the
// server must check it points to a file we stored before saving it.

// Token format: vercel_blob_rw_<storeId>_<secret> (same parsing as @vercel/blob).
const getBlobStoreHost = (): string | null => {
  const [, , , storeId] = (process.env.BLOB_READ_WRITE_TOKEN ?? "").split("_");
  return storeId
    ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com`
    : null;
};

// Path inside the store ("test/tmp/dog1-abc.jpg") of one of our blob URLs,
// or null for anything else.
const ownBlobPathname = (value: string): string | null => {
  const storeHost = getBlobStoreHost();
  if (!storeHost || !URL.canParse(value) || value.includes("..")) return null;

  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== storeHost) return null;
  return url.pathname.slice(1);
};

// A file uploaded by the form and not saved to a project yet.
const isTempUploadUrl = (value: string): boolean =>
  ownBlobPathname(value)?.startsWith(TEMP_UPLOAD_PREFIX) ?? false;

// Any cover of this environment: a temporary upload or a saved cover.
const isOwnUploadUrl = (value: string): boolean => {
  const pathname = ownBlobPathname(value);
  return (
    pathname !== null &&
    (pathname.startsWith(TEMP_UPLOAD_PREFIX) ||
      pathname.startsWith(PROJECT_COVERS_PREFIX))
  );
};

// "dog1-abc.jpg" from ".../test/tmp/dog1-abc.jpg".
const blobFileName = (value: string): string =>
  new URL(value).pathname.split("/").pop() ?? "";

export { blobFileName, isOwnUploadUrl, isTempUploadUrl };
