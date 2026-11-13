"use client";

import { useOptimistic, useTransition } from "react";
import { setProjectFavorite } from "@/actions/projects";
import { FavoriteButton } from "@/components/FavoriteButton/favorite-button";
import type { Project } from "@/db/generated/prisma/browser";

type ProjectCardFavoriteProps = {
  project: Pick<Project, "public_id" | "favorite">;
};

// The card's star, saved to the project. It changes right away (optimistic)
// and goes back on its own if saving fails.
export function ProjectCardFavorite({ project }: ProjectCardFavoriteProps) {
  const { public_id, favorite } = project;
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(favorite);
  const [, startTransition] = useTransition();

  function handlePressedChange(pressed: boolean) {
    startTransition(async () => {
      setOptimisticFavorite(pressed);
      const { message } = await setProjectFavorite(public_id, pressed);
      if (message) window.alert(message);
    });
  }

  return (
    <FavoriteButton
      pressed={optimisticFavorite}
      onPressedChange={handlePressedChange}
    />
  );
}
