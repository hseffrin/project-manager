"use client";

import Image from "next/image";
import { Progress } from "radix-ui";
import { useEffect, useId, useState } from "react";
import { ErrorCode, useDropzone } from "react-dropzone";

import type { Accept, FileError, FileRejection } from "react-dropzone";
import { Button } from "@/components/Button/button";
import { IconButton } from "@/components/IconButton/icon-button";
import deleteIcon from "@/components/icons/delete.svg";
import { uploadFile } from "@/utils/upload/upload-client";
import { MAX_UPLOAD_BYTES } from "@/utils/upload/uploads";
import { normalizeFileSize } from "@/utils/string-format";
import uploadIcon from "./icons/upload.svg";

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

type Upload =
  | {
      status: "uploading";
      fileName: string;
      progress: number;
      controller: AbortController;
    }
  | { status: "done"; url: string };

type FileDropzoneProps = {
  /** Form field name that receives the uploaded file URL. */
  name?: string;
  label?: string;
  /** MIME types → extensions, e.g. `{ "image/png": [".png"] }`. */
  accept?: Accept;
  /** Text inside the empty dropzone. */
  hint?: string;
  /** Blocks the form submit until a file finished uploading. */
  required?: boolean;
  requiredMessage?: string;
  /** Error returned by the server for this field. */
  error?: string;
  /** Called with true when a file is uploaded and nothing is uploading. */
  onReadyChange?: (ready: boolean) => void;
};

// Single image picker: uploads the file straight to Blob and shows a preview.
// The form only receives the uploaded URL, in a hidden input.
export function FileDropzone({
  name = "file",
  label = "Arquivo",
  accept,
  hint = `Escolha um arquivo de até ${normalizeFileSize(MAX_UPLOAD_BYTES)}`,
  required = false,
  requiredMessage = "Envie um arquivo",
  error,
  onReadyChange,
}: FileDropzoneProps) {
  const inputId = useId();
  const [upload, setUpload] = useState<Upload | null>(null);
  const [uploadError, setUploadError] = useState<string>();
  const [blockedSubmit, setBlockedSubmit] = useState(false);

  const {
    getRootProps,
    getInputProps,
    inputRef,
    open,
    isDragActive,
    isDragReject,
  } = useDropzone({
    accept,
    maxSize: MAX_UPLOAD_BYTES,
    multiple: false,
    // Only the "Selecionar" button opens the file dialog; the whole box
    // still accepts drops.
    noClick: true,
    onDrop: handleDrop,
  });

  const uploading = upload?.status === "uploading";
  const ready = upload?.status === "done";
  const validityMessage = uploading
    ? "Aguarde o envio do arquivo terminar"
    : required && !ready
      ? requiredMessage
      : "";
  const shownError = (blockedSubmit && validityMessage) || uploadError || error;

  // While the file is uploading (or a required file is missing), mark the
  // picker as invalid so the browser refuses to submit the form (no Radix
  // Form.Control here because it resets custom validity on its own).
  // react-dropzone keeps its input focusable precisely so form validation
  // still works on it.
  useEffect(() => {
    inputRef.current?.setCustomValidity(validityMessage);
  }, [inputRef, validityMessage]);

  useEffect(() => {
    onReadyChange?.(ready);
  }, [onReadyChange, ready]);

  async function startUpload(file: File) {
    const controller = new AbortController();
    setUpload({
      status: "uploading",
      fileName: file.name,
      progress: 0,
      controller,
    });

    try {
      const { url } = await uploadFile(file, {
        signal: controller.signal,
        onProgress: (progress) =>
          setUpload((prev) =>
            prev?.status === "uploading" ? { ...prev, progress } : prev,
          ),
      });
      setUpload({ status: "done", url });
    } catch (uploadFailure) {
      if (controller.signal.aborted) return; // replaced or removed
      setUpload(null);
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : "Falha no envio",
      );
    }
  }

  function handleDrop(accepted: File[], rejections: FileRejection[]) {
    // Clear the native input: the file goes to Blob, not with the form
    // submit. This also lets the user pick the same file again.
    if (inputRef.current) inputRef.current.value = "";
    setBlockedSubmit(false);
    setUploadError(undefined);

    // A new file replaces the current one.
    if (upload?.status === "uploading") upload.controller.abort();

    if (rejections.length > 0) {
      setUpload(null);
      setUploadError(rejections[0].errors.map(errorMessage).join(" · "));
      return;
    }
    if (accepted[0]) startUpload(accepted[0]);
  }

  function removeFile() {
    if (upload?.status === "uploading") upload.controller.abort();
    setUpload(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-base text-brand-label">
        {label}
      </label>

      {upload?.status === "done" ? (
        <div className="relative aspect-video w-full overflow-hidden rounded">
          <Image
            src={upload.url}
            alt="Capa escolhida"
            fill
            sizes="(min-width: 768px) 704px, 100vw"
            className="object-cover"
          />
          <IconButton
            label="Remover capa"
            variant="circle"
            icon={<Image src={deleteIcon} alt="" />}
            onClick={removeFile}
            className="absolute top-4 right-4"
          />
        </div>
      ) : (
        <div
          {...getRootProps({
            className: `flex flex-col items-center justify-center gap-4 rounded border border-dashed px-4 py-6 text-center transition ${
              isDragReject || shownError
                ? "border-brand-error"
                : isDragActive
                  ? "border-brand-label bg-brand-label/5"
                  : "border-brand-input-border"
            }`,
          })}
        >
          <Image src={uploadIcon} alt="" />

          {upload?.status === "uploading" ? (
            <div className="flex w-full max-w-sm flex-col gap-2 text-sm text-brand-card-label">
              <p className="truncate">
                Enviando {upload.fileName} ({Math.round(upload.progress)}%)
              </p>
              <Progress.Root
                value={upload.progress}
                className="h-1 overflow-hidden rounded-full bg-black/10"
              >
                <Progress.Indicator
                  className="h-full bg-brand-label transition-transform"
                  style={{
                    transform: `translateX(-${100 - upload.progress}%)`,
                  }}
                />
              </Progress.Root>
              <button
                type="button"
                onClick={removeFile}
                className="cursor-pointer self-center text-brand-label hover:underline"
              >
                Cancelar envio
              </button>
            </div>
          ) : (
            <>
              <p className="text-brand-card-label">
                {isDragReject ? "Tipo de arquivo não permitido" : hint}
              </p>
              <Button
                label="Selecionar"
                variant="secondary"
                size="sm"
                onClick={open}
              />
            </>
          )}

          {/* Hidden native input managed by react-dropzone. No `name`, so the
              raw file is never sent with the form. The <label> above names
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
      )}

      {shownError && (
        <span className="text-xs text-brand-error" role="alert">
          {shownError}
        </span>
      )}

      {upload?.status === "done" && (
        <input type="hidden" name={name} value={upload.url} />
      )}
    </div>
  );
}
