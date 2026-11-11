// Server-only: decides where uploads go.
// - "blob": Vercel Blob (needs BLOB_READ_WRITE_TOKEN)
// - "local": files saved to .uploads/ on this machine (development only)
// Set UPLOAD_DRIVER=local to force local mode even when a Blob token exists.
type UploadDriver = "blob" | "local";

const getUploadDriver = (): UploadDriver => {
  if (process.env.UPLOAD_DRIVER === "local") return "local";
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
};

export { getUploadDriver };
export type { UploadDriver };
