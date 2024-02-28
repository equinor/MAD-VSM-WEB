import { createToBeProject, getProject } from "../../services/projectApi";
import { useMutation, useQuery } from "react-query";

import { ToggleButton } from "components/ToggleButton";
import { ToggleButtonGroup } from "components/ToggleButtonGroup";
import { useRouter } from "next/router";
import { unknownErrorToString } from "utils/isError";
import { useStoreDispatch } from "hooks/storeHooks";
import { useAccess } from "./hooks/useAccess";

export const ToBeToggle = (): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;

  const { data: project } = useQuery(["project", id], () => getProject(id));
  const { userCanEdit } = useAccess(project);
  const dispatch = useStoreDispatch();
  const isToBe = !!project?.currentProcessId;

  const newProjectMutation = useMutation(
    (id: string | string[]) => createToBeProject(id),
    {
      onSuccess: (res) => {
        return router.push(`/process/${res.data}`);
      },
      onError: (e) => dispatch.setSnackMessage(unknownErrorToString(e)),
    }
  );

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 20,
        right: 0,
        top: 64,
        margin: 12,
        padding: 12,
        borderRadius: 4,
      }}
    >
      <ToggleButtonGroup>
        {/* 
        // Note:
        // - currentProcessId is only defined on a "To-be" process
        // - toBeProcessID is only defined on the "Current" proccess
        // We may use this information to know what type of process we are currently viewing.
       */}
        <ToggleButton
          name="Current"
          selected={!isToBe} // currentProcessId is null if we are on the "Current"-process.
          onClick={() => {
            if (isToBe) {
              // We are on a "To-be" process and there exists a "Current" process
              // Let's navigate to it
              router.replace(`/process/${project.currentProcessId}`);
            }
          }}
        />
        <ToggleButton
          name="To be"
          selected={!!project?.currentProcessId} // currentProcessId is truthy if we are on the "To-be"-process.
          disabled={
            !userCanEdit &&
            !(project?.toBeProcessID || project?.currentProcessId)
          }
          onClick={() => {
            if (!isToBe && project?.toBeProcessID) {
              // We are currently on the "Current"-process and there exists a "To-be" process
              // Let's navigate to it
              router.replace(`/process/${project?.toBeProcessID}`);
            } else if (!isToBe && !project?.toBeProcessID) {
              // We are on a "Current" process, but there is no "To-be" process created
              // Let's create one and navigate to it
              newProjectMutation.mutate(id);
            }
          }}
          disabledTooltip="There is no To-be process and you don't have access to create one."
        />
      </ToggleButtonGroup>
    </div>
  );
};
