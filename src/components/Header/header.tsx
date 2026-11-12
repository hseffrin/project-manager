import Image from "next/image";

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
        <Image src="/search.svg" alt="Buscar Projeto" width={20} height={20} />
      </div>
    </div>
  );
}
