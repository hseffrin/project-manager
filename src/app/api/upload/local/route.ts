import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import {
  isLocalStorageAllowed,
  resolveLocalPath,
  sanitizeFilename,
} from "@/utils/upload/local-storage";
import { MAX_UPLOAD_BYTES, UPLOAD_PREFIX } from "@/utils/upload/uploads";

// Local-mode equivalent of the Vercel Blob upload: receives the raw file
// body and writes it to .uploads/projects/<random>-<filename>.
export async function POST(request: Request) {
  if (!isLocalStorageAllowed()) {
    return Response.json(
      { error: "Local uploads are disabled" },
      { status: 404 },
    );
  }

  const filename = new URL(request.url).searchParams.get("filename");
  if (!filename || !request.body) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "File too large" }, { status: 413 });
  }

  // Random prefix mirrors Blob's addRandomSuffix: same name never overwrites.
  const key = `${UPLOAD_PREFIX}${crypto.randomUUID().slice(0, 8)}-${sanitizeFilename(filename)}`;
  const target = resolveLocalPath(key);
  if (!target) {
    return Response.json({ error: "Invalid file name" }, { status: 400 });
  }

  // Content-Length can lie, so count the bytes as they arrive too.
  let received = 0;
  const sizeGuard = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length;
      callback(
        received > MAX_UPLOAD_BYTES ? new Error("File too large") : null,
        chunk,
      );
    },
  });

  try {
    await mkdir(path.dirname(target), { recursive: true });
    await pipeline(
      Readable.fromWeb(request.body as NodeReadableStream<Uint8Array>),
      sizeGuard,
      createWriteStream(target),
    );
  } catch {
    await rm(target, { force: true });
    const tooLarge = received > MAX_UPLOAD_BYTES;
    return Response.json(
      { error: tooLarge ? "File too large" : "Upload failed" },
      { status: tooLarge ? 413 : 500 },
    );
  }

  return Response.json({ url: `/api/files/${key}`, pathname: key });
}
