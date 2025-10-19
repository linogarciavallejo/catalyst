import React from "react";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  copyright?: string;
  // Support for legacy columns prop (ignored)
  columns?: Record<string, unknown>[];
  social?: Record<string, unknown>[];
}

export const Footer: React.FC<FooterProps> = ({
  copyright = "© 2025 Catalyst. All rights reserved.",
  className = "",
  ...props
}) => {
  return (
    <footer
      className={`bg-gray-900 text-white border-t border-gray-800 ${className}`.trim()}
      {...props}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-sm text-gray-400">{copyright}</p>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";
