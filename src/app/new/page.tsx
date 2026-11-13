import { NavigationBar } from "@/components/NavigationBar/navigation-bar";
import { ProjectForm } from "@/components/Project/project-form";

export default function CreatePlan() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-10 pt-17 pb-16">
      <NavigationBar title="Novo projeto" />
      <ProjectForm />
    </main>
  );
}
