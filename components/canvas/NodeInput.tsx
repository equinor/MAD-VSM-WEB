import { TextField, TextFieldProps } from "@equinor/eds-core-react";
import { ChangeEvent, useEffect, useState } from "react";

export type NodeInputProps = Omit<TextFieldProps, "value"> & {
  initialValue?: string | null;
};

export const NodeInput = (props: NodeInputProps) => {
  const [value, setValue] = useState(props.initialValue || "");
  useEffect(() => {
    if (props.initialValue) setValue(props.initialValue);
  }, [props.initialValue]);

  return (
    <TextField
      {...(props as TextFieldProps)}
      value={value}
      onChange={(
        e: ChangeEvent<HTMLInputElement> & ChangeEvent<HTMLTextAreaElement>
      ) => {
        setValue(e.target.value);
        props.onChange?.(e);
      }}
      style={{ backgroundColor: "transparent" }}
    />
  );
};
