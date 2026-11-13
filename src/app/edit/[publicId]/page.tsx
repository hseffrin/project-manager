import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { NavigationBar } from "@/components/NavigationBar/navigation-bar";
import { ProjectForm } from "@/components/Project/project-form";
import { ProjectFormSkeleton } from "@/components/Project/project-form-skeleton";
import { prisma } from "@/db/client";

type EditProjectFormProps = {
  params: PageProps<"/edit/[publicId]">["params"];
};

// Reads the project at request time, so it sits behind a Suspense boundary
// (Cache Components): the title and "Voltar" render right away.
async function EditProjectForm({ params }: EditProjectFormProps) {
  // Not a uuid: Postgres would reject the query, so answer 404 right away.
  const publicId = z.uuid().safeParse((await params).publicId);
  if (!publicId.success) notFound();

  const project = await prisma.project.findUnique({
    where: { public_id: publicId.data },
    select: {
      public_id: true,
      name: true,
      customer: true,
      date_start: true,
      date_end: true,
      cover_url: true,
    },
  });
  if (!project) notFound();

  return <ProjectForm project={project} />;
}

export default function EditProject({ params }: PageProps<"/edit/[publicId]">) {
  return (
    <main className="flex flex-1 flex-col gap-8 px-8 py-16">
      <NavigationBar title="Editar projeto" />
      <Suspense fallback={<ProjectFormSkeleton />}>
        <EditProjectForm params={params} />
      </Suspense>
    </main>
  );
}
