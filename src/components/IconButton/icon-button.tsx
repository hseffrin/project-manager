import type { ComponentProps, ReactNode } from "react";

type IconButtonVariant = "plain" | "circle";

// Extra button props (ref, aria-*, data-*, onClick...) are passed through, so
// Radix triggers can use it with asChild.
type IconButtonProps = Omit<ComponentProps<"button">, "children"> & {
  icon: ReactNode;
  // Read by screen readers, since the button has no visible text.
  label: string;
  variant?: IconButtonVariant;
};

const variantClasses: Record<IconButtonVariant, string> = {
  plain: "",
  circle: "rounded-full bg-white shadow-md",
};

export function IconButton({
  icon,
  label,
  variant = "plain",
  className = "",
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...buttonProps}
      className={`flex size-8 cursor-pointer items-center justify-center transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-button-primary/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {icon}
    </button>
  );
}
