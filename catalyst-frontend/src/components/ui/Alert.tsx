import React from "react";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
  title?: string;
  closeable?: boolean;
  onClose?: () => void;
}

const typeClasses: Record<AlertType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: "bg-green-50",
    border: "border-l-4 border-green-500",
    text: "text-green-800",
    icon: "text-green-500",
  },
  error: {
    bg: "bg-red-50",
    border: "border-l-4 border-red-500",
    text: "text-red-800",
    icon: "text-red-500",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-l-4 border-yellow-500",
    text: "text-yellow-800",
    icon: "text-yellow-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-l-4 border-blue-500",
    text: "text-blue-800",
    icon: "text-blue-500",
  },
};

const icons: Record<AlertType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  closeable = false,
  onClose,
  children,
  className = "",
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const { bg, border, text, icon: iconClass } = typeClasses[type];

  return (
    <div className={`${bg} ${border} rounded-md p-4 ${className}`.trim()} {...props}>
      <div className="flex">
        <div className={`flex-shrink-0 ${iconClass}`}>{icons[type]}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${text}`}>{title}</h3>}
          <div className={`text-sm ${text} ${title ? "mt-2" : ""}`}>{children}</div>
        </div>
        {closeable && (
          <button
            onClick={handleClose}
            className={`ml-3 text-gray-400 hover:text-gray-600 transition-colors`}
            aria-label="Close alert"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

Alert.displayName = "Alert";
