import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import {
  isLocalStorageAllowed,
  resolveLocalPath,
} from "@/utils/upload/local-storage";

// Serves files saved by the local upload mode, so you can open them in dev.
// TODO: check that the logged-in user can see this project's files.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!isLocalStorageAllowed()) {
    return new Response("Not found", { status: 404 });
  }

  const { path: segments } = await params;
  const filePath = resolveLocalPath(segments.join("/"));
  const info = filePath ? await stat(filePath).catch(() => null) : null;
  if (!filePath || !info?.isFile()) {
    return new Response("Not found", { status: 404 });
  }

  const filename = path.basename(filePath);
  return new Response(
    Readable.toWeb(createReadStream(filePath)) as ReadableStream,
    {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(info.size),
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    },
  );
}
