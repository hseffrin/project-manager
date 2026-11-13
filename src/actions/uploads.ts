"use server";

import { del } from "@vercel/blob";
import { z } from "zod";
import { prisma } from "@/db/client";
import { isOwnUploadUrl } from "@/utils/upload/upload-url";

// Deletes a cover the user uploaded and then discarded before saving (trash
// button, or replaced by another file). Anyone can call a Server Action with
// any URL, so it only deletes files from our store that no project uses.
const deleteUnusedUpload = async (url: string): Promise<void> => {
  // TODO: check the logged-in user here once there is authentication.
  const parsed = z.string().refine(isOwnUploadUrl).safeParse(url);
  if (!parsed.success) return;

  try {
    const usedBy = await prisma.project.count({
      where: { cover_url: parsed.data },
    });
    if (usedBy > 0) return;

    await del(parsed.data);
  } catch (error) {
    // Only leaves an orphan file in the store, so just log it.
    console.error("Failed to delete unused upload", error);
  }
};

export { deleteUnusedUpload };
