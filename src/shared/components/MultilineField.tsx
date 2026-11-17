import { forwardRef } from "react";
import { type TextInputInstance } from "react-native";
import { Field, type FieldProps } from "./Field";
export type MultilineFieldProps = Omit<FieldProps, "multiline" | "password"> & {
  rows?: number;
  minHeight?: number;
};
export const MultilineField = forwardRef<
  TextInputInstance,
  MultilineFieldProps
>(function MultilineField({ rows = 4, minHeight = 128, style, ...props }, ref) {
  return (
    <Field
      {...props}
      ref={ref}
      multiline
      numberOfLines={rows}
      style={[{ minHeight, textAlignVertical: "top" }, style]}
    />
  );
});
