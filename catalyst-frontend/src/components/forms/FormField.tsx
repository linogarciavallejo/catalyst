import React from "react";
import { Input } from "../ui/Input";
import { useFormContext } from "./useFormContext";

export interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  validate?: (value: unknown) => string | undefined;
  help?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  validate,
  help,
  icon,
  className = "",
}) => {
  const { values, errors, touched, setFieldValue, setFieldError, setFieldTouched } =
    useFormContext();

  const value = values[name] ?? "";
  const error = touched[name] ? errors[name] : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFieldValue(name, newValue);

    // Validate on change
    if (validate) {
      const validationError = validate(newValue);
      setFieldError(name, validationError);
    }
  };

  const handleBlur = () => {
    setFieldTouched(name, true);

    // Validate on blur
    if (validate) {
      const validationError = validate(value);
      setFieldError(name, validationError);
    }
  };

  return (
    <Input
      name={name}
      label={label}
      type={type}
      value={typeof value === "string" ? value : ""}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      helpText={help}
      icon={icon}
      isRequired={required}
      className={className}
    />
  );
};

FormField.displayName = "FormField";
