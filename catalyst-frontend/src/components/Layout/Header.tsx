import React from "react";

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  title,
  actions,
  sticky = true,
  className = "",
  children,
  ...props
}) => {
  const stickyClass = sticky ? "sticky top-0 z-40" : "";
  const baseClasses =
    "bg-white shadow-sm border-b border-gray-200 transition-all duration-200";

  return (
    <header
      className={`${baseClasses} ${stickyClass} ${className}`.trim()}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {logo && <div className="flex-shrink-0">{logo}</div>}
            {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
            {children}
          </div>
          {actions && <div className="flex items-center gap-4">{actions}</div>}
        </div>
      </div>
    </header>
  );
};

Header.displayName = "Header";
