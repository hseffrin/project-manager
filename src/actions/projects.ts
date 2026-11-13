"use server";

import { del } from "@vercel/blob";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/db/client";
import { isOwnUploadUrl } from "@/utils/upload/upload-url";

const requiredText = (message: string) =>
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
    cover: z
      .string("Envie uma imagem de capa")
      .refine(isOwnUploadUrl, "Capa inválida, envie a imagem novamente"),
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
  cover_url: string;
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

const createProject = async (
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> => {
  // TODO: check the logged-in user here once there is authentication.
  const parsed = parseProjectForm(formData);
  if (!parsed.success) return parsed.state;

  try {
    await prisma.project.create({ data: parsed.data });
  } catch (error) {
    console.error("Failed to create project", error);
    return { message: "Não foi possível salvar o projeto. Tente novamente." };
  }

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

  let previousCover: string;
  try {
    const project = await prisma.project.findUnique({
      where: { public_id: id.data },
      select: { cover_url: true },
    });
    if (!project) return { message: "Projeto não encontrado." };
    previousCover = project.cover_url;

    await prisma.project.update({
      where: { public_id: id.data },
      data: parsed.data,
    });
  } catch (error) {
    console.error("Failed to update project", error);
    return { message: "Não foi possível salvar o projeto. Tente novamente." };
  }

  // A new cover replaced the old one, which no project uses anymore. As in
  // deleteProject, a failure only leaves an orphan file, so just log it.
  if (
    previousCover !== parsed.data.cover_url &&
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

  let coverUrl: string;
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
  if (isOwnUploadUrl(coverUrl)) {
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

export { createProject, deleteProject, updateProject };
export type { DeleteProjectState, ProjectFormState };
