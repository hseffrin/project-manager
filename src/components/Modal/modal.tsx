"use client";

import Image, { type StaticImageData } from "next/image";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";
import { Button } from "@/components/Button/button";

// Composed like Radix: ModalRoot holds the state, ModalTrigger opens it and
// ModalContent is the modal itself. Separate exports (not Modal.Root) because
// Server Components can't use dot access on a client module.

type ModalRootProps = {
  children: ReactNode;
  // Controlled use (e.g. opened from a menu item): open + onOpenChange.
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ModalRoot({ children, open, onOpenChange }: ModalRootProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

type ModalTriggerProps = {
  // A single element that passes its props to a <button>, like Button.
  children: ReactNode;
};

export function ModalTrigger({ children }: ModalTriggerProps) {
  return <Dialog.Trigger asChild>{children}</Dialog.Trigger>;
}

type ModalContentProps = {
  // Shown on the purple circle, so the file should be drawn in white.
  icon: StaticImageData;
  title: string;
  // Body below the divider. Read by screen readers as the description.
  children: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  // Runs on "Confirmar"; the modal closes right after.
  onConfirm: () => void;
};

export function ModalContent({
  icon,
  title,
  children,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  onConfirm,
}: ModalContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-20 bg-black/70" />

      <Dialog.Content className="fixed top-1/2 left-1/2 z-20 w-[calc(100%-2rem)] max-w-120 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white px-6.5 pt-14 pb-6.5 shadow-xl focus:outline-none">
        {/* Half of the circle sits above the top edge. */}
        <div className="absolute -top-6.5 left-1/2 flex size-13 -translate-x-1/2 items-center justify-center rounded-full bg-brand-button-primary shadow-md">
          <Image src={icon} alt="" />
        </div>

        <Dialog.Title className="text-center text-lg font-bold text-brand-title-h1">
          {title}
        </Dialog.Title>

        <hr className="my-7 border-black/40" />

        <Dialog.Description asChild>
          <div className="text-center">{children}</div>
        </Dialog.Description>

        <div className="mt-6 grid grid-cols-2 gap-6.5">
          <Dialog.Close asChild>
            <Button label={cancelLabel} variant="secondary" fullWidth />
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button label={confirmLabel} fullWidth onClick={onConfirm} />
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
