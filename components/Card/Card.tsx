import moment from "moment";
import React from "react";
import Link from "next/link";
import styles from "./Card.module.scss";
import { UserDots } from "../UserDots";
import { vsmProject } from "../../interfaces/VsmProject";
import { useMutation, useQueryClient } from "react-query";
import { faveProject, unfaveProject } from "services/projectApi";
import Heart from "components/Heart";

export function VSMCard(props: { vsm: vsmProject }): JSX.Element {
  const { userIdentity: createdBy } = props.vsm.created;
  const queryClient = useQueryClient();

  const faveMutation = useMutation(() => faveProject(props.vsm.vsmProjectID), {
    onSettled: () => queryClient.invalidateQueries(),
  });

  const unfaveMutation = useMutation(
    () => unfaveProject(props.vsm.vsmProjectID),
    { onSettled: () => queryClient.invalidateQueries() }
  );

  return (
    <Link href={`/projects/${props.vsm.vsmProjectID}`}>
      <div className={styles.card}>
        <div className={styles.topSection}>
          <div className={styles.vsmTitleContainer}>
            <h1 className={styles.vsmTitle}>
              {props.vsm.name || "Untitled VSM"}
            </h1>
          </div>
          <Heart
            isFavourite={props.vsm.isFavorite}
            fave={() => faveMutation.mutate()}
            unfave={() => unfaveMutation.mutate()}
          ></Heart>
        </div>
        <div>
          <div className={styles.bottomSection}>
            {!!props.vsm.lastUpdated && (
              <p className={styles.vsmLabel}>
                Edited {moment(props.vsm.lastUpdated.changeDate).fromNow()}
              </p>
            )}
            {createdBy && (
              <UserDots
                users={[
                  `${createdBy}`,
                  ...props.vsm.userAccesses.map((u) => u.user),
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
