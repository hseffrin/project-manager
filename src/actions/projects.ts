"use server";

import { copy, del } from "@vercel/blob";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/db/client";
import {
  blobFileName,
  isOwnUploadUrl,
  isTempUploadUrl,
} from "@/utils/upload/upload-url";
import { projectCoverPath } from "@/utils/upload/uploads";

const INVALID_COVER = "Capa inválida, envie a imagem novamente";

const requiredText = (message: string): z.ZodString =>
  z.string(message).trim().min(1, message);

const projectSchema = z
  .object({
    // Same messages and rules as the form fields.
    name: requiredText("Por favor, digite ao menos duas palavras").refine(
      (name) => name.split(/\s+/).length >= 2,
      "Por favor, digite ao menos duas palavras",
    ),
    customer: requiredText("Por favor, digite ao menos uma palavra"),
    startDate: z.iso.date("Selecione uma data válida"),
    endDate: z.iso.date("Selecione uma data válida"),
    // Optional: the form only sends it when a cover was uploaded.
    cover: z.string().refine(isOwnUploadUrl, INVALID_COVER).nullable(),
  })
  // ISO dates (YYYY-MM-DD) compare correctly as strings.
  .refine((project) => project.endDate >= project.startDate, {
    path: ["endDate"],
    message: "A data final não pode ser antes da data de início",
  });

type ProjectField = keyof z.input<typeof projectSchema>;

// State shown by the project form, for both create and update.
type ProjectFormState = {
  errors?: Partial<Record<ProjectField, string[]>>;
  message?: string;
};

type ProjectData = {
  name: string;
  customer: string;
  date_start: Date;
  date_end: Date;
  cover_url: string | null;
};

// Validates the project form fields and maps them to the database columns.
const parseProjectForm = (
  formData: FormData,
):
  | { success: true; data: ProjectData }
  | { success: false; state: ProjectFormState } => {
  const parsed = projectSchema.safeParse({
    name: formData.get("project-name"),
    customer: formData.get("customer"),
    startDate: formData.get("start-date"),
    endDate: formData.get("end-date"),
    cover: formData.get("cover"),
  });

  if (!parsed.success) {
    return {
      success: false,
      state: { errors: z.flattenError(parsed.error).fieldErrors },
    };
  }

  const { name, customer, startDate, endDate, cover } = parsed.data;
  return {
    success: true,
    data: {
      name,
      customer,
      date_start: new Date(startDate),
      date_end: new Date(endDate),
      cover_url: cover,
    },
  };
};

// The form uploads covers to a temporary folder; this moves one into the
// project's folder (projects/<public_id>/): copy, point the project at the
// copy, then delete the temporary file. Each step only runs if the previous
// one worked, so the project never points at a missing file. A failure keeps
// the temporary cover, which still works, and is only logged.
const moveCoverToProjectFolder = async (
  publicId: string,
  tempUrl: string,
): Promise<void> => {
  try {
    const { url } = await copy(
      tempUrl,
      projectCoverPath(publicId, blobFileName(tempUrl)),
      { access: "public" },
    );
    await prisma.project.update({
      where: { public_id: publicId },
      data: { cover_url: url },
    });
    await del(tempUrl);
  } catch (error) {
    console.error("Failed to move project cover to its folder", error);
  }
};

const createProject = async (
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> => {
  // TODO: check the logged-in user here once there is authentication.
  const parsed = parseProjectForm(formData);
  if (!parsed.success) return parsed.state;

  // A new project's cover, if any, must be a fresh upload: the project's
  // folder only exists once the database creates its public id.
  const cover = parsed.data.cover_url;
  if (cover && !isTempUploadUrl(cover)) {
    return { errors: { cover: [INVALID_COVER] } };
  }

  let publicId: string;
  try {
    ({ public_id: publicId } = await prisma.project.create({
      data: parsed.data,
      select: { public_id: true },
    }));
  } catch (error) {
    console.error("Failed to create project", error);
    return { message: "Não foi possível salvar o projeto. Tente novamente." };
  }

  if (cover) await moveCoverToProjectFolder(publicId, cover);

  // Outside the try: redirect() works by throwing.
  redirect("/");
};

// Called with the project already bound: updateProject.bind(null, publicId).
const updateProject = async (
  publicId: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> => {
  // TODO: check the logged-in user here once there is authentication.
  const id = z.uuid().safeParse(publicId);
  if (!id.success) return { message: "Projeto inválido." };

  const parsed = parseProjectForm(formData);
  if (!parsed.success) return parsed.state;
  const cover = parsed.data.cover_url;

  let previousCover: string | null;
  try {
    const project = await prisma.project.findUnique({
      where: { public_id: id.data },
      select: { cover_url: true },
    });
    if (!project) return { message: "Projeto não encontrado." };
    previousCover = project.cover_url;

    // The cover the project already has, a fresh upload, or none.
    if (cover && cover !== previousCover && !isTempUploadUrl(cover)) {
      return { errors: { cover: [INVALID_COVER] } };
    }

    await prisma.project.update({
      where: { public_id: id.data },
      data: parsed.data,
    });
  } catch (error) {
    console.error("Failed to update project", error);
    return { message: "Não foi possível salvar o projeto. Tente novamente." };
  }

  if (cover && cover !== previousCover) {
    await moveCoverToProjectFolder(id.data, cover);
  }

  // A new cover replaced the old one, which no project uses anymore. As in
  // deleteProject, a failure only leaves an orphan file, so just log it.
  // Replaced or removed: the old cover isn't used by any project anymore.
  if (
    previousCover &&
    cover !== previousCover &&
    isOwnUploadUrl(previousCover)
  ) {
    try {
      await del(previousCover);
    } catch (error) {
      console.error("Failed to delete previous project cover", error);
    }
  }

  // Outside the try: redirect() works by throwing.
  redirect("/");
};

type DeleteProjectState = {
  message?: string;
};

const deleteProject = async (publicId: string): Promise<DeleteProjectState> => {
  // TODO: check the logged-in user here once there is authentication.
  const parsed = z.uuid().safeParse(publicId);
  if (!parsed.success) return { message: "Projeto inválido." };

  let coverUrl: string | null;
  try {
    const project = await prisma.project.delete({
      where: { public_id: parsed.data },
      select: { cover_url: true },
    });
    coverUrl = project.cover_url;
  } catch (error) {
    console.error("Failed to delete project", error);
    return { message: "Não foi possível remover o projeto. Tente novamente." };
  }

  // The project is already gone, so a failure here only leaves an orphan file
  // in the Blob store; log it instead of reporting an error to the user.
  if (coverUrl && isOwnUploadUrl(coverUrl)) {
    try {
      await del(coverUrl);
    } catch (error) {
      console.error("Failed to delete project cover", error);
    }
  }

  // The home page is dynamic, so refreshing the router is enough to drop the
  // removed card.
  refresh();
  return {};
};

type SetProjectFavoriteState = {
  message?: string;
};

const setProjectFavorite = async (
  publicId: string,
  favorite: boolean,
): Promise<SetProjectFavoriteState> => {
  // TODO: check the logged-in user here once there is authentication.
  const parsed = z
    .object({ publicId: z.uuid(), favorite: z.boolean() })
    .safeParse({ publicId, favorite });
  if (!parsed.success) return { message: "Projeto inválido." };

  try {
    await prisma.project.update({
      where: { public_id: parsed.data.publicId },
      data: { favorite: parsed.data.favorite },
    });
  } catch (error) {
    console.error("Failed to update project favorite", error);
    return {
      message: "Não foi possível atualizar o favorito. Tente novamente.",
    };
  }

  // With "Apenas Favoritos" on, unfavoriting must drop the card.
  refresh();
  return {};
};

export { createProject, deleteProject, setProjectFavorite, updateProject };
export type { DeleteProjectState, ProjectFormState, SetProjectFavoriteState };
