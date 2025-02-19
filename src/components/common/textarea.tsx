// components/ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
  label?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      helperText,
      label,
      containerClassName,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const id = React.useId();

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          rows={rows}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={cn(
              "text-sm",
              error ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };

// Example usage:
const TextareaExample = () => {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (e.target.value.length > 500) {
      setError("Text cannot exceed 500 characters");
    } else {
      setError(undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic usage */}
      <Textarea placeholder="Type your message here." />

      {/* With label and helper text */}
      <Textarea
        label="Description"
        placeholder="Enter a detailed description"
        helperText="Maximum 500 characters"
      />

      {/* With validation */}
      <Textarea
        label="Feedback"
        placeholder="Enter your feedback"
        value={value}
        onChange={handleChange}
        error={error}
      />

      {/* Disabled state */}
      <Textarea
        label="Read Only"
        placeholder="This textarea is disabled"
        disabled
        value="This content cannot be edited"
      />

      {/* Custom size */}
      <Textarea
        label="Large Input"
        placeholder="This textarea has 8 rows"
        rows={8}
      />

      {/* Required field */}
      <Textarea
        label="Required Field"
        placeholder="This field is required"
        required
        helperText="This field cannot be empty"
      />
    </div>
  );
};
