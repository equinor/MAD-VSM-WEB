import { createProject, getProject } from "../../services/projectApi";
import { useAccount, useMsal } from "@azure/msal-react";
import { useMutation, useQuery } from "react-query";

import React from "react";
import { ToggleButton } from "components/ToggleButton";
import { ToggleButtonGroup } from "components/ToggleButtonGroup";
import { getMyAccess } from "utils/getMyAccess";
import { projectTemplatesV1 } from "../../assets/projectTemplatesV1";
import { useRouter } from "next/router";
import { vsmProject } from "../../interfaces/VsmProject";

export const ToBeToggle = (): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;

  const { data: project } = useQuery(["project", id], () => getProject(id));

  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const myAccess = getMyAccess(project, account);
  const userCanEdit = myAccess !== "Reader";

  const newProjectMutation = useMutation(() => {
    return createProject({
      currentProcessId: parseInt(`${id}`),
      ...projectTemplatesV1.defaultProject,
    } as vsmProject).then((value) =>
      router.push(`/process/${value.data.vsmProjectID}`)
    );
  });

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
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
          selected={!project?.currentProcessId} // currentProcessId is null if we are on the "Current"-process.
          onClick={() => {
            if (project.currentProcessId) {
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
            if (project.toBeProcessID) {
              // We are currently on the "Current"-process and there exists a "To-be" process
              // Let's navigate to it
              router.replace(`/process/${project.toBeProcessID}`);
            } else {
              // We are on a "Current" process, but there is no "To-be" process created
              // Let's create one and navigate to it
              newProjectMutation.mutate();
            }
          }}
          disabledTooltip="There is no To-be process and you don't have access to create one."
        />
      </ToggleButtonGroup>
    </div>
  );
};
