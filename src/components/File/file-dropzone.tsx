"use client";

import { Progress } from "radix-ui";
import { useEffect, useId, useState } from "react";
import { ErrorCode, useDropzone } from "react-dropzone";

import type { Accept, FileError, FileRejection } from "react-dropzone";
import { uploadFile } from "@/utils/upload/upload-client";
import { MAX_UPLOAD_BYTES } from "@/utils/upload/uploads";
import { normalizeFileSize } from "@/utils/string-format";

function errorMessage(error: FileError) {
  switch (error.code) {
    case ErrorCode.FileTooLarge:
      return `Maior que ${normalizeFileSize(MAX_UPLOAD_BYTES)}`;
    case ErrorCode.FileInvalidType:
      return "Tipo de arquivo não permitido";
    case ErrorCode.TooManyFiles:
      return "Envie apenas um arquivo";
    default:
      return error.message;
  }
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
  /** Form field name that receives the uploaded file URLs (one entry per file). */
  name?: string;
  label?: string;
  /** MIME types → extensions, e.g. `{ "image/*": [], "application/pdf": [".pdf"] }`. */
  accept?: Accept;
  hint?: string;
  /** Single-file mode: a new file replaces the current one. */
  multiple?: boolean;
  /** Blocks the form submit until at least one file finished uploading. */
  required?: boolean;
  requiredMessage?: string;
  /** Error returned by the server for this field. */
  error?: string;
};

export function FileDropzone({
  name = "files",
  label = "Arquivos",
  accept,
  hint = `Qualquer tipo de arquivo, até ${normalizeFileSize(MAX_UPLOAD_BYTES)}`,
  multiple = true,
  required = false,
  requiredMessage = "Envie um arquivo",
  error,
}: FileDropzoneProps) {
  const inputId = useId();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [blockedSubmit, setBlockedSubmit] = useState(false);

  const { getRootProps, getInputProps, inputRef, isDragActive, isDragReject } =
    useDropzone({
      accept,
      maxSize: MAX_UPLOAD_BYTES,
      multiple,
      maxFiles: multiple ? 0 : 1,
      onDrop: handleDrop,
    });

  const uploading = items.some((item) => item.status === "uploading");
  const hasFile = items.some((item) => item.status === "done");
  const validityMessage = uploading
    ? "Aguarde o envio dos arquivos terminar"
    : required && !hasFile
      ? requiredMessage
      : "";
  const shownError = (blockedSubmit && validityMessage) || error;

  // While files are still uploading (or a required file is missing), mark
  // the picker as invalid so the browser refuses to submit the form (no Radix
  // Form.Control here because it resets custom validity on its own).
  // react-dropzone keeps its input focusable precisely so form validation
  // still works on it.
  useEffect(() => {
    inputRef.current?.setCustomValidity(validityMessage);
  }, [inputRef, validityMessage]);

  function updateItem(id: string, patch: Partial<UploadItem>) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function newItem(file: File, patch?: Partial<UploadItem>): UploadItem {
    return {
      id: crypto.randomUUID(),
      file,
      status: "uploading",
      progress: 0,
      controller: new AbortController(),
      ...patch,
    };
  }

  async function startUpload(file: File) {
    const item = newItem(file);
    setItems((prev) => [...prev, item]);

    try {
      const { url } = await uploadFile(file, {
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

  function handleDrop(accepted: File[], rejections: FileRejection[]) {
    // Clear the native input: files go to Blob, not with the form submit.
    // This also lets the user pick the same file again.
    if (inputRef.current) inputRef.current.value = "";
    setBlockedSubmit(false);

    // Single-file mode: the new file replaces the current one.
    if (!multiple) {
      setItems((prev) => {
        prev.forEach((item) => item.controller.abort());
        return [];
      });
    }

    // Rejected files (too large, wrong type) stay in the list as errors.
    if (rejections.length > 0) {
      setItems((prev) => [
        ...prev,
        ...rejections.map(({ file, errors }) =>
          newItem(file, {
            status: "error",
            error: errors.map(errorMessage).join(" · "),
          }),
        ),
      ]);
    }
    accepted.forEach(startUpload);
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
        {shownError && (
          <span className="text-xs text-red-600" role="alert">
            {shownError}
          </span>
        )}
      </div>

      <div
        {...getRootProps({
          className: `flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 ${
            isDragReject
              ? "border-red-500 bg-red-500/5"
              : isDragActive
                ? "border-blue-500 bg-blue-500/5"
                : "border-black/15 hover:border-black/30 dark:border-white/20 dark:hover:border-white/40"
          }`,
        })}
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
        {isDragReject ? (
          <p className="font-medium text-red-600">
            Tipo de arquivo não permitido
          </p>
        ) : (
          <p>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Clique para escolher
            </span>{" "}
            ou arraste {multiple ? "os arquivos" : "o arquivo"} aqui
          </p>
        )}
        <p className="text-xs text-foreground/60">{hint}</p>

        {/* Hidden native input managed by react-dropzone. No `name`, so the
            raw files are never sent with the form. The <label> above names
            it, so drop the library's generic "file upload" aria-label. */}
        <input
          {...getInputProps({
            id: inputId,
            "aria-label": undefined,
            onInvalid: (e) => {
              e.preventDefault();
              setBlockedSubmit(true);
            },
          })}
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
                    {item.status === "done" &&
                      normalizeFileSize(item.file.size)}
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
