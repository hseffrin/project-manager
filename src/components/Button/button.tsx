import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

// Extra button props (ref, aria-*, onClick...) are passed through, so Radix
// parts like Dialog.Close can use it with asChild.
type ButtonProps = Omit<ComponentProps<"button">, "children"> & {
  label: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
  // Fills the parent width on every screen size. Otherwise, from md up it is
  // at least 158px wide and grows with the label.
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-brand-button-primary bg-brand-button-primary text-brand-button-primary-label",
  secondary:
    "border-brand-button-secondary-label bg-brand-button-secondary text-brand-button-secondary-label",
};

export function Button({
  label,
  icon,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type="button"
      {...buttonProps}
      className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-base font-medium whitespace-nowrap transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${fullWidth ? "" : "md:w-auto md:min-w-39.5"} ${variantClasses[variant]} ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
