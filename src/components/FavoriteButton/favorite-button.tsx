"use client";

import Image from "next/image";
import { Toggle } from "radix-ui";
import { IconButton } from "@/components/IconButton/icon-button";
import starEmptyIcon from "./icons/stat-empty.svg";
import starFilledIcon from "./icons/star-filled.svg";

type FavoriteButtonProps = {
  // Controlled: pass pressed + onPressedChange. Uncontrolled: defaultPressed.
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
};

export function FavoriteButton(props: FavoriteButtonProps) {
  return (
    <Toggle.Root asChild {...props}>
      {/* Radix sets data-state="on" | "off"; each star shows in one state.
          aria-pressed tells screen readers the state, so the label is fixed. */}
      <IconButton
        label="Favoritar"
        className="group"
        icon={
          <>
            <Image
              src={starEmptyIcon}
              alt=""
              className="group-data-[state=on]:hidden"
            />
            <Image
              src={starFilledIcon}
              alt=""
              className="group-data-[state=off]:hidden"
            />
          </>
        }
      />
    </Toggle.Root>
  );
}
