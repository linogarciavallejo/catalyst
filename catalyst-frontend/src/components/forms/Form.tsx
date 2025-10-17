import React, { createContext, useState, useCallback } from "react";

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormContextType {
  values: Record<string, unknown>;
  errors: FormErrors;
  touched: Record<string, boolean>;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string | undefined) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export interface FormProps {
  initialValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  initialValues,
  onSubmit,
  children,
  className = "",
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: string, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const value: FormContextType = {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
  };

  return (
    <FormContext.Provider value={value}>
      <form onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

Form.displayName = "Form";

export { FormContext };
