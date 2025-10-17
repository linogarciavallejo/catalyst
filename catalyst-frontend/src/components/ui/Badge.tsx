import React from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info";

export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-purple-100 text-purple-800",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs font-medium",
  md: "px-3 py-1 text-sm font-medium",
  lg: "px-4 py-1.5 text-base font-medium",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "md",
  rounded = false,
  className = "",
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center gap-2 font-medium";
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const roundedClass = rounded ? "rounded-full" : "rounded-md";

  const combinedClasses = `${baseClasses} ${variantClass} ${sizeClass} ${roundedClass} ${className}`.trim();

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
