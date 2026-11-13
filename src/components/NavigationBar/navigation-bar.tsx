"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import backIcon from "./icons/back.svg";

type NavigationBarProps = {
  title: string;
};

// Top of every screen except the home: "Voltar" and the page title.
export function NavigationBar({ title }: NavigationBarProps) {
  const router = useRouter();

  // Same as the browser back button, but never leaves the site: when the
  // previous entry is another site (or there is none), go to the home instead.
  // navigation.canGoBack only counts entries from this site; TS has no types
  // for the Navigation API yet, and history.length is the fallback.
  function handleBack() {
    const { navigation } = window as Window & {
      navigation?: { canGoBack: boolean };
    };
    const canGoBack = navigation
      ? navigation.canGoBack
      : window.history.length > 1;

    if (canGoBack) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    // Spacing and the 5px inset measured from the designs, where the bar sits
    // slightly in from the page margin.
    <div className="flex flex-col gap-2.5 pl-1.25">
      <button
        type="button"
        onClick={handleBack}
        className="flex cursor-pointer items-center gap-2 self-start text-base text-brand-label hover:underline focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none"
      >
        <Image src={backIcon} alt="" />
        Voltar
      </button>
      <h1 className="text-2xl font-bold text-brand-title-h1">{title}</h1>
    </div>
  );
}
