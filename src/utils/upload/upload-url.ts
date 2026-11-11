import { UPLOAD_PREFIX } from "./uploads";

// Server-only: the form sends the uploaded file URL as plain text, so the
// server must check it points to a file we stored before saving it.

// Token format: vercel_blob_rw_<storeId>_<secret> (same parsing as @vercel/blob).
const getBlobStoreHost = (): string | null => {
  const [, , , storeId] = (process.env.BLOB_READ_WRITE_TOKEN ?? "").split("_");
  return storeId
    ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com`
    : null;
};

const isOwnUploadUrl = (value: string): boolean => {
  const storeHost = getBlobStoreHost();
  if (!storeHost || !URL.canParse(value) || value.includes("..")) return false;

  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    url.hostname === storeHost &&
    url.pathname.startsWith(`/${UPLOAD_PREFIX}`)
  );
};

export { isOwnUploadUrl };
