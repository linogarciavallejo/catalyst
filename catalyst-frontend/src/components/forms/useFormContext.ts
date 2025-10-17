import React from "react";
import { FormContext, type FormContextType } from "./Form";

/**
 * Hook to use Form context within Form component
 * @returns FormContextType - Form state and methods
 * @throws Error if used outside of Form component
 */
export const useFormContext = (): FormContextType => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a Form component");
  }
  return context;
};
