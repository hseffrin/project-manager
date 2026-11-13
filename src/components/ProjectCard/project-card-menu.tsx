"use client";

import { useState, useTransition } from "react";
import { deleteProject } from "@/actions/projects";
import { ModalContent, ModalRoot } from "@/components/Modal/modal";
import { MoreButton } from "@/components/MoreButton/more-button";
import type { Project } from "@/db/generated/prisma/browser";
import deleteWhiteIcon from "./icons/delete-white.svg";
import deleteIcon from "./icons/delete.svg";

type ProjectCardMenuProps = {
  project: Pick<Project, "id" | "name">;
};

// The "…" menu of a project card. "Remover" asks for confirmation in a modal
// before deleting the project.
export function ProjectCardMenu({ project }: ProjectCardMenuProps) {
  const { id, name } = project;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();

  // The modal closes on "Confirmar"; on success the card disappears when the
  // action refreshes the page. Errors are rare (database down), so an alert
  // is enough for now.
  function handleRemove() {
    startTransition(async () => {
      const { message } = await deleteProject(id);
      if (message) window.alert(message);
    });
  }

  return (
    <>
      <MoreButton
        options={{
          remove: {
            icon: deleteIcon,
            label: "Remover",
            action: () => setConfirmOpen(true),
          },
        }}
      />

      <ModalRoot open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ModalContent
          icon={deleteWhiteIcon}
          title="Remover projeto"
          onConfirm={handleRemove}
        >
          <p>Essa ação removerá definitivamente o projeto:</p>
          <p className="mt-2 font-bold">{name}</p>
        </ModalContent>
      </ModalRoot>
    </>
  );
}
