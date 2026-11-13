import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "md" | "sm";

// Extra button props (ref, aria-*, onClick...) are passed through, so Radix
// parts like Dialog.Close can use it with asChild.
type ButtonProps = Omit<ComponentProps<"button">, "children"> & {
  label: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
  // md (48px) for main actions, sm (40px) for buttons inside other controls.
  size?: ButtonSize;
  // Fills the parent width on every screen size. Otherwise, from md up it is
  // at least 158px wide and grows with the label.
  fullWidth?: boolean;
};

// Primary has its own disabled color in the design; secondary just fades.
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-brand-button-primary bg-brand-button-primary text-brand-button-primary-label disabled:border-brand-button-primary-disabled disabled:bg-brand-button-primary-disabled",
  secondary:
    "border-brand-button-secondary-label bg-brand-button-secondary text-brand-button-secondary-label disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-12",
  sm: "h-10",
};

export function Button({
  label,
  icon,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type="button"
      {...buttonProps}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-base font-medium whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none enabled:hover:opacity-90 disabled:cursor-not-allowed ${fullWidth ? "" : "md:w-auto md:min-w-39.5"} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
