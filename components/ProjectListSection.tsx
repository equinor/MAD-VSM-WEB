import {
  placeholderProjectCardsArray,
  projectCardsArray,
} from "../utils/getProjectCardsArray";

import Masonry from "react-masonry-css";
import { NewProcessButton } from "./NewProcessButton";
import { Typography } from "@equinor/eds-core-react";
import styles from "./ProjectListSection.module.scss";
import { Project } from "../types/Project";

export function ProjectListSection(props: {
  projects: Project[];
  isLoading: boolean;
  expectedNumberOfProjects: number;
  showNewProcessButton: boolean;
}): JSX.Element {
  const {
    isLoading,
    projects,
    showNewProcessButton,
    expectedNumberOfProjects,
  } = props;

  if (projects?.length < 1) {
    return (
      <div className={styles.emptyVsmCardContainer}>
        <Typography variant="h4" style={{ marginBottom: "30px" }}>
          No processes match your search criteria.
        </Typography>
        {showNewProcessButton && <NewProcessButton />}
      </div>
    );
  }

  return (
    <>
      <Masonry
        breakpointCols={{
          default: 4,
          1648: 3,
          1300: 2,
          952: 1,
        }}
        className={styles.grid}
        columnClassName={styles.gridColumn}
      >
        {showNewProcessButton && <NewProcessButton />}
        {isLoading
          ? placeholderProjectCardsArray(expectedNumberOfProjects)
          : projectCardsArray(projects)}
      </Masonry>
    </>
  );
}
