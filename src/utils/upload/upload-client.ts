import { upload } from "@vercel/blob/client";
import { TEMP_UPLOAD_PREFIX } from "./uploads";

// Letters without accents, digits, "-" and "_". Anything else, accents
// aside, becomes "-".
const cleanNamePart = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// The name the file gets in the Blob: "Capa..final (1).JPG" becomes
// "Capa-final-1.jpg". The upload route refuses paths with "..", and spaces
// or symbols would only make the URL harder to read.
const safeFileName = (fileName: string): string => {
  const dot = fileName.lastIndexOf(".");
  const name = cleanNamePart(dot > 0 ? fileName.slice(0, dot) : fileName);
  const extension = dot > 0 ? cleanNamePart(fileName.slice(dot + 1)) : "";
  return `${name || "capa"}${extension ? `.${extension.toLowerCase()}` : ""}`;
};

type UploadOptions = {
  signal: AbortSignal;
  onProgress: (percentage: number) => void;
};

/**
 * Uploads a file straight from the browser to Vercel Blob, in the temporary
 * folder, and returns its URL. Saving the project moves it to its folder.
 */
const uploadFile = async (
  file: File,
  { signal, onProgress }: UploadOptions,
): Promise<{ url: string }> => {
  const blob = await upload(
    `${TEMP_UPLOAD_PREFIX}${safeFileName(file.name)}`,
    file,
    {
      access: "public",
      handleUploadUrl: "/api/upload",
      abortSignal: signal,
      onUploadProgress: ({ percentage }) => onProgress(percentage),
    },
  );
  return { url: blob.url };
};

export { uploadFile };
