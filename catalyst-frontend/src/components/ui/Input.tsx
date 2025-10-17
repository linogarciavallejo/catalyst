import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, isRequired = false, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed";

    const borderClass = error
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 hover:border-gray-400";

    const combinedClasses = `${baseClasses} ${borderClass} ${className}`.trim();

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${combinedClasses} ${icon ? "pl-10" : ""}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        {helpText && !error && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
