import { NodeDataCommon } from "../types/NodeData";
import { Autocomplete, TextField } from "@equinor/eds-core-react";
import {
  getTimeDefinitionDisplayName,
  getTimeDefinitionValue,
  getTimeDefinitionDisplayNames,
} from "@/utils/unitDefinitions";
import { ChangeEvent, useEffect, useState } from "react";
import { sortSearch } from "@/utils/sortSearch";

type DurationComponent = {
  selectedNode: NodeDataCommon | undefined;
  onChangeDuration: (e: {
    duration: number | null;
    unit: string | null;
  }) => void;
  disabled: boolean;
};

export function DurationComponent({
  selectedNode,
  onChangeDuration,
  disabled,
}: DurationComponent) {
  const [duration, setDuration] = useState<number | null>(
    selectedNode?.duration ?? null
  );
  const [unit, setUnit] = useState<string | null>(selectedNode?.unit ?? null);
  const [unitSearchInput, setUnitSearchInput] = useState("");

  const timeDefinitionDisplayNames = getTimeDefinitionDisplayNames();

  useEffect(() => {
    if (selectedNode) {
      setDuration(selectedNode.duration);
      setUnit(selectedNode.unit);
    }
  }, [selectedNode]);

  const parseValue = (value: string) =>
    value === "" ? null : parseFloat(value);

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseValue(event.target.value);
    setDuration(value);
    onChangeDuration({
      duration: value,
      unit: unit,
    });
  };

  const handleUnitChange = (unit: string) => {
    setUnitSearchInput(unit);
    const value = getTimeDefinitionValue(unit);
    setUnit(value);
    onChangeDuration({ duration, unit: value });
  };

  return (
    <div style={{ display: "flex" }}>
      <TextField
        disabled={disabled}
        label={"Duration"}
        type={"number"}
        id={"vsmObjectTime"}
        min={0}
        value={`${duration === null ? "" : duration}`}
        onChange={handleDurationChange}
      />
      <div style={{ padding: 8 }} />
      <Autocomplete
        disabled={disabled}
        options={sortSearch(timeDefinitionDisplayNames, unitSearchInput)}
        onInputChange={handleUnitChange}
        selectedOptions={[
          unit ? getTimeDefinitionDisplayName(unit) : undefined,
        ]}
        optionsFilter={() => true}
        label="Unit"
        autoWidth
      />
    </div>
  );
}
