import type { MouseEventHandler, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  label: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
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
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-base font-medium transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:w-39.5 ${variantClasses[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}
