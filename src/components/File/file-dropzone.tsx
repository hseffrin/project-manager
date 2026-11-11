"use client";

import { Progress } from "radix-ui";
import { useEffect, useId, useRef, useState } from "react";
import { uploadFile } from "@/utils/upload/upload-client";
import type { UploadDriver } from "@/utils/upload/upload-driver";
import { MAX_UPLOAD_BYTES } from "@/utils/upload/uploads";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type UploadItem = {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  progress: number;
  url?: string;
  error?: string;
  controller: AbortController;
};

type FileDropzoneProps = {
  /** Where files are stored; decided on the server by getUploadDriver(). */
  driver: UploadDriver;
  /** Form field name that receives the uploaded file URLs (one entry per file). */
  name?: string;
  label?: string;
  accept?: string;
  hint?: string;
};

export function FileDropzone({
  driver,
  name = "files",
  label = "Arquivos",
  accept,
  hint = `Qualquer tipo de arquivo, até ${formatSize(MAX_UPLOAD_BYTES)}`,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [blockedSubmit, setBlockedSubmit] = useState(false);

  const uploading = items.some((item) => item.status === "uploading");

  // While files are still uploading, mark the picker as invalid so the
  // browser refuses to submit the form (no Radix Form.Control here because
  // it resets custom validity on its own).
  useEffect(() => {
    inputRef.current?.setCustomValidity(
      uploading ? "Aguarde o envio dos arquivos terminar." : "",
    );
  }, [uploading]);

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function startUpload(file: File) {
    const item: UploadItem = {
      id: crypto.randomUUID(),
      file,
      status: "uploading",
      progress: 0,
      controller: new AbortController(),
    };

    if (file.size > MAX_UPLOAD_BYTES) {
      setItems((prev) => [
        ...prev,
        {
          ...item,
          status: "error",
          error: `Maior que ${formatSize(MAX_UPLOAD_BYTES)}`,
        },
      ]);
      return;
    }

    setItems((prev) => [...prev, item]);

    try {
      const { url } = await uploadFile(driver, file, {
        signal: item.controller.signal,
        onProgress: (progress) => updateItem(item.id, { progress }),
      });
      updateItem(item.id, { status: "done", progress: 100, url });
    } catch (error) {
      if (item.controller.signal.aborted) return; // removed by the user
      updateItem(item.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Falha no envio",
      });
    }
  }

  function handleSelect(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    // Clear the native input: files go to Blob, not with the form submit.
    // This also lets the user pick the same file again.
    if (inputRef.current) inputRef.current.value = "";
    setBlockedSubmit(false);
    files.forEach(startUpload);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      prev.find((item) => item.id === id)?.controller.abort();
      return prev.filter((item) => item.id !== id);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
        {blockedSubmit && uploading && (
          <span className="text-xs text-red-600">
            Aguarde o envio dos arquivos terminar
          </span>
        )}
      </div>

      <div
        className={`relative flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition has-focus-visible:ring-2 has-focus-visible:ring-blue-500/30 ${
          dragging
            ? "border-blue-500 bg-blue-500/5"
            : "border-black/15 hover:border-black/30 dark:border-white/20 dark:hover:border-white/40"
        }`}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="mb-1 size-8 text-foreground/50"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
        <p>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            Clique para escolher
          </span>{" "}
          ou arraste os arquivos aqui
        </p>
        <p className="text-xs text-foreground/60">{hint}</p>

        {/* Invisible native input covering the zone: handles click and drop.
            No `name`, so the raw files are never sent with the form. */}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => handleSelect(e.target.files)}
          onInvalid={(e) => {
            e.preventDefault();
            setBlockedSubmit(true);
          }}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDrop={() => setDragging(false)}
        />
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex flex-col gap-1.5 rounded-md border px-3 py-2 text-sm ${
                item.status === "error"
                  ? "border-red-500/50"
                  : "border-black/10 dark:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">{item.file.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-xs ${
                      item.status === "error"
                        ? "text-red-600"
                        : "text-foreground/60"
                    }`}
                  >
                    {item.status === "uploading" &&
                      `${Math.round(item.progress)}%`}
                    {item.status === "done" && formatSize(item.file.size)}
                    {item.status === "error" && item.error}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={
                      item.status === "uploading"
                        ? `Cancelar envio de ${item.file.name}`
                        : `Remover ${item.file.name}`
                    }
                    className="rounded p-0.5 text-foreground/50 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="size-4"
                    >
                      <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </span>
              </div>

              {item.status === "uploading" && (
                <Progress.Root
                  value={item.progress}
                  className="h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15"
                >
                  <Progress.Indicator
                    className="h-full bg-blue-500 transition-transform"
                    style={{
                      transform: `translateX(-${100 - item.progress}%)`,
                    }}
                  />
                </Progress.Root>
              )}

              {item.status === "done" && item.url && (
                <input type="hidden" name={name} value={item.url} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
