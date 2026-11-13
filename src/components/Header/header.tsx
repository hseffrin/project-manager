import Image from "next/image";
import { SearchIcon } from "@/components/icons/search-icon";

export function Header() {
  return (
    <div className="flex h-20.25 items-center bg-brand-fg px-6">
      <div className="flex-1"></div>
      <div className="flex-none">
        <Image
          src="/logo.svg"
          alt="Logo do Gerenciador de Projetos"
          width={193}
          height={72}
        />
      </div>
      <div className="flex flex-1 justify-end">
        <SearchIcon className="text-white" title="Buscar Projeto" />
      </div>
    </div>
  );
}
