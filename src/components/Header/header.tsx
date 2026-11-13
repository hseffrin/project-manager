import Image from "next/image";
import searchIcon from "./icons/search.svg";

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
        <Image src={searchIcon} alt="Buscar Projeto" />
      </div>
    </div>
  );
}
