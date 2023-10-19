import { taskObject } from "../types/taskObject";
import { useStoreDispatch } from "../hooks/storeHooks";
import { TextField } from "@equinor/eds-core-react";
import { debounce } from "../utils/debounce";
import { useMutation, useQueryClient } from "react-query";
import { unknownErrorToString } from "../utils/isError";
import { updateTask } from "../services/taskApi";
import { useRouter } from "next/router";
import { notifyOthers } from "../services/notifyOthers";
import { useAccount, useMsal } from "@azure/msal-react";
import { vsmObject } from "types/VsmObject";

export function EditTaskTextField(props: {
  task: taskObject;
  disabled: boolean;
  vsmObject: vsmObject;
}): JSX.Element {
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const { description, id } = props.task;
  const dispatch = useStoreDispatch();

  const router = useRouter();
  const { id: projectId } = router.query;
  const queryClient = useQueryClient();
  const updateTaskMutation = useMutation(
    (newObject: taskObject) => {
      return updateTask(newObject, projectId, id, props.vsmObject.id);
    },
    {
      onSuccess: () => {
        notifyOthers("Updated a Q/I/P", projectId, account);
        return queryClient.invalidateQueries();
      },
      onError: (e) => dispatch.setSnackMessage(unknownErrorToString(e)),
    }
  );

  return (
    <TextField
      disabled={props.disabled}
      label={"Task description"}
      variant={"default"}
      defaultValue={description} //Since we set a default value and not a value, it only updates on init
      id={`taskDescription-${id}`}
      onChange={(event) => {
        const updatedTask: taskObject = {
          ...props.task,
          description: event.target.value.substr(0, 4000),
        };
        debounce(
          () => {
            updateTaskMutation.mutate(updatedTask);
          },
          1000,
          "SideBarContent-UpdateTask"
        );
      }}
      multiline
      rows={5}
    />
  );
}
