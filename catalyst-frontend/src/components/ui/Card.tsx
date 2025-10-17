import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-6",
  lg: "p-8",
};

const variantClasses = {
  default: "bg-white border border-gray-200",
  outlined: "border-2 border-gray-300",
  elevated: "bg-white shadow-lg",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      hoverable = false,
      padding = "md",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "rounded-lg transition-all duration-200 bg-white";
    const variantClass = variantClasses[variant];
    const paddingClass = paddingClasses[padding];
    const hoverClass = hoverable ? "hover:shadow-lg hover:border-gray-300" : "";

    const combinedClasses = `${baseClasses} ${variantClass} ${paddingClass} ${hoverClass} ${className}`.trim();

    return (
      <div ref={ref} className={combinedClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  children,
  className = "",
  ...props
}) => (
  <div
    className={`flex items-start justify-between pb-4 border-b border-gray-200 ${className}`.trim()}
    {...props}
  >
    <div className="flex-1">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      {children}
    </div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

CardHeader.displayName = "CardHeader";

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, ...props }) => (
  <div className={`py-4 ${className}`.trim()} {...props}>
    {children}
  </div>
);

CardBody.displayName = "CardBody";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right" | "between";
}

const alignClasses = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
  between: "justify-between",
};

export const CardFooter: React.FC<CardFooterProps> = ({
  align = "between",
  className = "",
  children,
  ...props
}) => (
  <div
    className={`flex ${alignClasses[align]} gap-3 pt-4 border-t border-gray-200 ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
);

CardFooter.displayName = "CardFooter";
