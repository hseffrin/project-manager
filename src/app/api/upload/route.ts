import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  TEMP_UPLOAD_PREFIX,
} from "@/utils/upload/uploads";

// Issues short-lived client tokens so the browser uploads straight to
// Vercel Blob. The files never pass through this server, which avoids the
// 1 MB Server Action body limit and the 4.5 MB function payload limit.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // TODO: check the logged-in user here before issuing a token.
        // Without that, anyone who finds this route can upload to the store.
        // Uploads only go to the temporary folder; saving a project moves the
        // cover to its own folder on the server.
        if (
          !pathname.startsWith(TEMP_UPLOAD_PREFIX) ||
          pathname.includes("..")
        ) {
          throw new Error("Invalid upload path");
        }

        return {
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: true,
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
