import React from "react";

export type SpinnerSize = "sm" | "md" | "lg" | "xl";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
  xl: "w-12 h-12 border-4",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`inline-block ${sizeClass} rounded-full border-current border-r-transparent animate-spin ${className}`.trim()}
      role="status"
      aria-label="Loading"
    />
  );
};

Spinner.displayName = "Spinner";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "w-full",
  height = "h-4",
  circle = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 background-size-200";
  const shapeClass = circle ? "rounded-full" : "rounded-md";

  return (
    <div className={`${baseClasses} ${width} ${height} ${shapeClass} ${className}`.trim()} {...props} />
  );
};

Skeleton.displayName = "Skeleton";

interface LoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export const Loading: React.FC<LoadingProps> = ({ isLoading, children }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size="lg" />
    </div>
  );
};

Loading.displayName = "Loading";
