import { upload } from "@vercel/blob/client";
import type { UploadDriver } from "./upload-driver";
import { UPLOAD_PREFIX } from "./uploads";

type UploadOptions = {
  signal: AbortSignal;
  onProgress: (percentage: number) => void;
};

// XMLHttpRequest instead of fetch because fetch has no upload progress events.
const uploadLocal = (
  file: File,
  { signal, onProgress }: UploadOptions,
): Promise<{ url: string }> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `/api/upload/local?filename=${encodeURIComponent(file.name)}`,
    );
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
      else reject(new Error(xhr.response?.error ?? `Erro ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Falha de rede"));
    xhr.onabort = () =>
      reject(new DOMException("Upload cancelado", "AbortError"));
    signal.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.send(file);
  });

/** Uploads a file with the configured driver and returns its URL. */
const uploadFile = async (
  driver: UploadDriver,
  file: File,
  options: UploadOptions,
): Promise<{ url: string }> => {
  if (driver === "local") return uploadLocal(file, options);

  const blob = await upload(`${UPLOAD_PREFIX}${file.name}`, file, {
    access: "private",
    handleUploadUrl: "/api/upload",
    abortSignal: options.signal,
    onUploadProgress: ({ percentage }) => options.onProgress(percentage),
  });
  return { url: blob.url };
};

export { uploadFile };
