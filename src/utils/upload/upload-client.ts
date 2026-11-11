import { upload } from "@vercel/blob/client";
import { UPLOAD_PREFIX } from "./uploads";

type UploadOptions = {
  signal: AbortSignal;
  onProgress: (percentage: number) => void;
};

/** Uploads a file straight from the browser to Vercel Blob and returns its URL. */
const uploadFile = async (
  file: File,
  { signal, onProgress }: UploadOptions,
): Promise<{ url: string }> => {
  const blob = await upload(`${UPLOAD_PREFIX}${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    abortSignal: signal,
    onUploadProgress: ({ percentage }) => onProgress(percentage),
  });
  return { url: blob.url };
};

export { uploadFile };
