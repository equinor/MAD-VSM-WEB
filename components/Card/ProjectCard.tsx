import { Button, Icon, Scrim, Tooltip } from "@equinor/eds-core-react";
import { useState } from "react";
import { faveProject, unfaveProject } from "services/projectApi";
import { useMutation, useQueryClient } from "react-query";

import { AccessBox } from "components/AccessBox";
import { Heart } from "components/Heart";
import { Labels } from "components/Labels/Labels";
import { ManageLabelBox } from "components/Labels/ManageLabelBox";
import { ProjectCardHeader } from "./ProjectCardHeader";
import { UserDots } from "./UserDots";
import styles from "./Card.module.scss";
import { tag } from "@equinor/eds-icons";
import Link from "next/link";
import { Project } from "../../types/Project";
import { useAccess } from "../canvas/hooks/useAccess";

export function ProjectCard(props: { vsm: Project }): JSX.Element {
  const queryClient = useQueryClient();
  const [isMutatingFavourite, setIsMutatingFavourite] = useState(false);

  const [visibleScrim, setVisibleScrim] = useState(false);
  const [visibleLabelScrim, setVisibleLabelScrim] = useState(false);

  const { isAdmin, userCanEdit } = useAccess(props.vsm);

  const handleSettled = () => {
    queryClient.invalidateQueries().then(() => setIsMutatingFavourite(false));
  };

  const faveMutation = useMutation(
    () => {
      setIsMutatingFavourite(true);
      return faveProject(props.vsm.vsmProjectID);
    },
    {
      onSettled: handleSettled,
    }
  );

  const unfaveMutation = useMutation(
    () => {
      setIsMutatingFavourite(true);
      return unfaveProject(props.vsm.vsmProjectID);
    },
    {
      onSettled: handleSettled,
    }
  );

  return (
    <>
      <Link href={`/process/${props.vsm.vsmProjectID}`} className={styles.card}>
        <div className={styles.section}>
          <ProjectCardHeader vsm={props.vsm} />
          <Heart
            isFavourite={props.vsm.isFavorite}
            fave={() => faveMutation.mutate()}
            unfave={() => unfaveMutation.mutate()}
            isLoading={isMutatingFavourite}
          />
        </div>
        <div className={`${styles.section} ${styles.labelSection}`}>
          <Labels labels={props.vsm.labels} />
        </div>
        <div className={`${styles.section} ${styles.bottomSection}`}>
          <UserDots
            userAccesses={props.vsm.userAccesses}
            setVisibleScrim={(any: boolean) => setVisibleScrim(any)}
          />
          {userCanEdit && (
            <Tooltip title="Manage process labels" placement="right">
              <Button
                color="primary"
                variant="ghost_icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setVisibleLabelScrim(true);
                }}
              >
                <Icon data={tag} />
              </Button>
            </Tooltip>
          )}
        </div>
      </Link>

      <Scrim
        open={visibleScrim}
        onClose={() => setVisibleScrim(false)}
        isDismissable
      >
        <AccessBox
          project={props.vsm}
          handleClose={() => setVisibleScrim(false)}
          isAdmin={isAdmin}
        />
      </Scrim>

      <ManageLabelBox
        handleClose={() => setVisibleLabelScrim(false)}
        isVisible={visibleLabelScrim}
        process={props.vsm}
      />
    </>
  );
}
