"use client";

import Image, { type StaticImageData } from "next/image";
import { Popover } from "radix-ui";
import { IconButton } from "@/components/IconButton/icon-button";

type MoreButtonOption = {
  // An imported image file: import editIcon from "./icons/edit.svg".
  // Draw it in the brand-label color (#695CCD), same as the item labels.
  icon?: StaticImageData;
  label: string;
  action: () => void;
};

type MoreButtonProps = {
  // One entry per popover item, in the order they are shown. The key is
  // only an id, for example { edit: {...}, remove: {...} }.
  options: Record<string, MoreButtonOption>;
};

export function MoreButton({ options }: MoreButtonProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton
          label="Mais opções"
          variant="circle"
          icon={
            <span
              aria-hidden
              className="text-xs leading-none tracking-tight text-brand-button-primary"
            >
              •••
            </span>
          }
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-10 min-w-44 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/10"
        >
          <ul className="flex flex-col divide-y divide-black/10">
            {Object.entries(options).map(([key, { icon, label, action }]) => (
              <li key={key}>
                <Popover.Close asChild>
                  <button
                    type="button"
                    onClick={action}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-brand-label hover:bg-black/5 focus-visible:bg-black/5 focus-visible:outline-none"
                  >
                    {icon && <Image src={icon} alt="" />}
                    {label}
                  </button>
                </Popover.Close>
              </li>
            ))}
          </ul>
          <Popover.Arrow width={16} height={8} className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export type { MoreButtonOption };
