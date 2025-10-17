import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "outline"
  | "ghost";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400",
  secondary:
    "bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-400",
  success:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:bg-green-400",
  warning:
    "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 disabled:bg-yellow-400",
  outline:
    "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:border-blue-400 disabled:text-blue-400",
  ghost:
    "text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      isDisabled = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = isDisabled || disabled || isLoading;

    const baseClasses =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed";

    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    const widthClass = fullWidth ? "w-full" : "";

    const combinedClasses = `${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim();

    return (
      <button
        ref={ref}
        disabled={isButtonDisabled}
        className={combinedClasses}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && <span>{icon}</span>}
            {children}
            {icon && iconPosition === "right" && <span>{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
