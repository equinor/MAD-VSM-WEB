import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Layouts } from "../../../layouts/LayoutWrapper";
import { useMutation, useQuery } from "react-query";
import { createProject, getProject } from "../../../services/projectApi";
import { getProjectAsCleanJsonWithoutQIPs } from "../../../utils/DownloadJSON";
import { vsmProject } from "../../../interfaces/VsmProject";
import { debounce } from "../../../utils/debounce";

export default function DuplicatePage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(["project", id], () => getProject(id));

  const [statusMessage, setStatusMessage] = useState("");
  const newProjectMutation = useMutation((project: vsmProject) =>
    createProject(project).then((value) =>
      router.replace(`/projects/${value.data.vsmProjectID}`)
    )
  );

  useEffect(() => {
    if (project) {
      setStatusMessage("Preparing project");
      const json = getProjectAsCleanJsonWithoutQIPs(
        project,
        `Duplicate of ${!!project.name ? project.name : "Untitled VSM"} (${
          project.vsmProjectID
        })`
      );
      if (json) {
        setStatusMessage("Creating new project");
        debounce(
          //Hack to stop sending multiple requests when the project-object changes
          () => newProjectMutation.mutate(json),
          1000,
          "CreateNewProject"
        );
      }
    }
  }, [project]);

  function Progress() {
    if (isLoading) return <h1>Fetching project</h1>;
    if (error) return <h1>Failed to fetch project</h1>;
    return <h1>{statusMessage}</h1>;
  }

  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <Progress />
    </div>
  );
}

DuplicatePage.layout = Layouts.Default;
DuplicatePage.auth = true;
