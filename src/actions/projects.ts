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
    name: requiredText("Informe o nome do projeto"),
    customer: requiredText("Informe o cliente"),
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

type CreateProjectState = {
  errors?: Partial<Record<ProjectField, string[]>>;
  message?: string;
};

const createProject = async (
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> => {
  // TODO: check the logged-in user here once there is authentication.
  const parsed = projectSchema.safeParse({
    name: formData.get("project-name"),
    customer: formData.get("customer"),
    startDate: formData.get("start-date"),
    endDate: formData.get("end-date"),
    cover: formData.get("cover"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, customer, startDate, endDate, cover } = parsed.data;
  try {
    await prisma.project.create({
      data: {
        name,
        customer,
        date_start: new Date(startDate),
        date_end: new Date(endDate),
        cover_url: cover,
      },
    });
  } catch (error) {
    console.error("Failed to create project", error);
    return { message: "Não foi possível salvar o projeto. Tente novamente." };
  }

  // Outside the try: redirect() works by throwing.
  redirect("/");
};

type DeleteProjectState = {
  message?: string;
};

const deleteProject = async (id: number): Promise<DeleteProjectState> => {
  // TODO: check the logged-in user here once there is authentication.
  const parsed = z.number().int().positive().safeParse(id);
  if (!parsed.success) return { message: "Projeto inválido." };

  let coverUrl: string;
  try {
    const project = await prisma.project.delete({
      where: { id: parsed.data },
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

export { createProject, deleteProject };
export type { CreateProjectState, DeleteProjectState };
