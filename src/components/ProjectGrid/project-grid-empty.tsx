"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button/button";
import newIcon from "./icons/new.svg";

export function ProjectGridEmpty() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h2 className="text-lg font-bold text-brand-title-h1">Nenhum projeto</h2>
      <p className="mt-3 text-sm text-brand-card-label">
        Clique no botão abaixo para criar o primeiro e gerenciá-lo.
      </p>
      <div className="mt-8">
        <Button
          label="Novo projeto"
          icon={<Image src={newIcon} alt="" />}
          onClick={() => router.push("/new")}
        />
      </div>
    </div>
  );
}
