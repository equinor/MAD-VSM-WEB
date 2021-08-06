import { useQuery } from "react-query";
import { getTaskTypes } from "../services/taskApi";
import { unknownErrorToString } from "../utils/isError";
import { SingleSelect } from "@equinor/eds-core-react";
import React from "react";

export function SelectTaskType(props: { onSelect: (e) => void }): JSX.Element {
  const {
    data: taskTypes,
    isLoading,
    error,
  } = useQuery(["taskTypes"], () => getTaskTypes());
  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>{unknownErrorToString(error)}</p>;
  }
  return (
    <div style={{ paddingBottom: 16 }}>
      <SingleSelect
        label={"Select type"}
        items={taskTypes.map((t) => t.name)}
        handleSelectedItemChange={(e) =>
          props.onSelect(
            taskTypes.find((t) => e.selectedItem === t.name).vsmTaskTypeID //Wow... there must be a better way
          )
        }
        initialSelectedItem={taskTypes[0]?.name}
      />
    </div>
  );
}
