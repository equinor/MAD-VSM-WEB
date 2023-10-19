import { Fragment, useState } from "react";
import { SideBarHeader } from "./SideBarHeader";
import { NewTaskSection } from "./NewTaskSection";
import { SideBarBody } from "./SideBarBody";
import { useMutation, useQueryClient } from "react-query";
import { vsmObject } from "../types/VsmObject";
import { patchGraph } from "services/graphApi";
import { debounce } from "../utils/debounce";
import styles from "./VSMCanvas.module.scss";
import { Button, Icon, Typography } from "@equinor/eds-core-react";
import { unknownErrorToString } from "utils/isError";
import { useStoreDispatch } from "hooks/storeHooks";
import { close as closeIcon } from "@equinor/eds-icons";
import { notifyOthers } from "../services/notifyOthers";
import { useRouter } from "next/router";
import { useAccount, useMsal } from "@azure/msal-react";

/**
 * Process specific content stuff
 * @param props
 * @constructor
 */
export function SideBarContent(props: {
  onClose: () => void;
  onDelete: () => void;
  canEdit: boolean;
  selectedObject;
  isLoading: boolean;
}): JSX.Element {
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useStoreDispatch();
  const queryClient = useQueryClient();
  const vsmObjectMutation = useMutation(
    (patchedObject: vsmObject) =>
      patchGraph(patchedObject, id, patchedObject.id),
    {
      onSuccess() {
        notifyOthers("Updated a card", id, account);
        return queryClient.invalidateQueries();
      },
      onError: (e) => dispatch.setSnackMessage(unknownErrorToString(e)),
    }
  );

  function patchCard(
    selectedObject: vsmObject,
    updates: {
      description?: string;
      role?: string;
      duration?: number;
      unit?: string;
    }
  ) {
    debounce(
      () => {
        vsmObjectMutation.mutate({
          id: selectedObject.id,
          ...{ ...selectedObject, ...updates },
        });
      },
      1500,
      `update ${Object.keys(updates)[0]} - ${selectedObject.id}`
    );
  }

  const selectedObject = props.selectedObject;
  const [showNewTaskSection, setShowNewTaskSection] = useState(false);

  if (props.isLoading) {
    return (
      <div className={styles.headerContainer}>
        <div className={styles.sideBarLoadingText}>
          <Typography variant={"h1"}>Loading...</Typography>
        </div>
        <div className={styles.actions}>
          <Button
            title={"Close the side-menu"}
            variant={"ghost_icon"}
            color={"primary"}
            onClick={props.onClose}
          >
            <Icon data={closeIcon} title="add" size={24} />
          </Button>
        </div>
      </div>
    );
  }
  if (vsmObjectMutation.error) {
    return (
      <div className={styles.sideBarLoadingText}>
        <div className={styles.headerContainer}>
          <Typography variant={"h1"}>Oups! We have an error.</Typography>
          <div className={styles.actions}>
            <Button
              title={"Close the side-menu"}
              variant={"ghost_icon"}
              color={"primary"}
              onClick={props.onClose}
            >
              <Icon data={closeIcon} title="add" size={24} />
            </Button>
          </div>
        </div>
        <p>{unknownErrorToString(vsmObjectMutation.error)}</p>
      </div>
    );
  }

  if (showNewTaskSection)
    return (
      <NewTaskSection
        onClose={() => setShowNewTaskSection(false)}
        selectedObject={selectedObject}
      />
    );

  return (
    <Fragment key={selectedObject?.id}>
      <SideBarHeader
        object={selectedObject}
        onClose={props.onClose}
        onDelete={props.onDelete}
        canEdit={props.canEdit}
      />
      <SideBarBody
        selectedObject={selectedObject}
        onChangeDescription={(description) =>
          patchCard(selectedObject, { description })
        }
        onChangeRole={(e) =>
          patchCard(selectedObject, { role: e.target.value })
        }
        onChangeDuration={(e) =>
          patchCard(selectedObject, { duration: e.duration, unit: e.unit })
        }
        setShowNewTaskSection={setShowNewTaskSection}
        canEdit={props.canEdit}
      />
    </Fragment>
  );
}
