"use server";

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

export { createProject };
export type { CreateProjectState };
