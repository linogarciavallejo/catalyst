import React from "react";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    title?: string;
    links?: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
    }>;
  }[];
  copyright?: string;
  social?: Array<{
    icon: React.ReactNode;
    href?: string;
    label?: string;
  }>;
}

export const Footer: React.FC<FooterProps> = ({
  columns = [],
  copyright,
  social = [],
  className = "",
  children,
  ...props
}) => {
  return (
    <footer
      className={`bg-gray-900 text-white border-t border-gray-800 ${className}`.trim()}
      {...props}
    >
      {/* Main content */}
      {(columns.length > 0 || social.length > 0 || children) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Columns */}
            {columns.map((column, idx) => (
              <div key={idx}>
                {column.title && (
                  <h3 className="text-sm font-semibold text-white mb-4">{column.title}</h3>
                )}
                <ul className="space-y-2">
                  {column.links?.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      {link.href ? (
                        <a
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <button
                          onClick={link.onClick}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Social links */}
            {social.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Follow us</h3>
                <div className="flex gap-4">
                  {social.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      aria-label={item.label}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {children}
        </div>
      )}

      {/* Copyright */}
      {copyright && (
        <div className="border-t border-gray-800 px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-400">{copyright}</p>
        </div>
      )}
    </footer>
  );
};

Footer.displayName = "Footer";
