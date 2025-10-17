import React from "react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  active?: boolean;
  children?: SidebarItem[];
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[];
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isOpen = true,
  className = "",
  ...props
}) => {
  return (
    <aside
      className={`${isOpen ? "w-64" : "w-0"} bg-gray-900 text-white overflow-hidden transition-all duration-300 ${className}`.trim()}
      {...props}
    >
      <nav className="pt-8 px-4 space-y-2">
        {items.map((item) => (
          <SidebarLink key={item.id} item={item} />
        ))}
      </nav>
    </aside>
  );
};

Sidebar.displayName = "Sidebar";

interface SidebarLinkProps {
  item: SidebarItem;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const baseClasses =
    "flex items-center justify-between px-4 py-2 rounded-lg transition-colors duration-200";
  const activeClass = item.active
    ? "bg-blue-600 text-white"
    : "text-gray-300 hover:bg-gray-800";

  return (
    <div>
      <button
        onClick={() => {
          if (item.children) {
            setIsExpanded(!isExpanded);
          }
          item.onClick?.();
        }}
        className={`${baseClasses} ${activeClass} w-full`}
      >
        <div className="flex items-center gap-3">
          {item.icon && <span className="w-5 h-5">{item.icon}</span>}
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.badge && <span>{item.badge}</span>}
          {item.children && (
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Submenu */}
      {item.children && isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-4">
          {item.children.map((child) => (
            <SidebarLink key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};
