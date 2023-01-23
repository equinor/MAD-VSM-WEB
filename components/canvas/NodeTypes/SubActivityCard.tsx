import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { formatCanvasText } from "../utils/FormatCanvasText";
import { formatDuration } from "types/timeDefinitions";

import styles from "./Card.module.css";
import { SubActivityButton } from "./SubActivityButton";
import { CardButtonsContainer } from "./CardButtonsContainer";
import { ChoiceButton } from "./ChoiceButton";
import { WaitingButton } from "./WaitingButton";
import { QIPRContainer } from "./QIPRContainer";
import { MergeButton } from "./MergeButton";
import { Button, Checkbox } from "@equinor/eds-core-react";
import { NodeData } from "interfaces/NodeData";
import { Node } from "reactflow";

export const SubActivityCard = (props: Node<NodeData>) => {
  const [hovering, setHovering] = useState(false);
  const [selectedButton, setSelectedButton] = useState<string>(null);

  const {
    card: { name, role, time, timeDefinition, vsmObjectType, tasks },
    isDropTarget,
    isValidDropTarget,
    columnId,
    onClickMergeButton,
    mergeOption,
    mergeInitiator,
    confirmMerge,
    cancelMerge,
    onClickMergeOption,
    mergeable,
  } = props.data;

  useEffect(() => {
    setHovering(false);
  }, [props.dragging]);

  useEffect(() => {
    setSelectedButton(null);
  }, [mergeInitiator]);

  const renderCardButtons = () => {
    if (mergeInitiator) {
      return (
        // Seperate component?
        <CardButtonsContainer position={Position.Bottom}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Checkbox checked readOnly onClick={() => cancelMerge(columnId)} />
            <MergeButton onClick={() => cancelMerge(columnId)} active />
          </div>
          <SubActivityButton
            onClick={() => setSelectedButton("SubActivity")}
            active={selectedButton === "SubActivity"}
          />
          <ChoiceButton
            onClick={() => setSelectedButton("Choice")}
            active={selectedButton === "Choice"}
          />
          <WaitingButton
            onClick={() => setSelectedButton("Waiting")}
            active={selectedButton === "Waiting"}
          />
          <Button
            onClick={() => confirmMerge(selectedButton)}
            disabled={!selectedButton}
          >
            MERGE
          </Button>
        </CardButtonsContainer>
      );
    } else if (mergeOption) {
      return (
        <CardButtonsContainer position={Position.Bottom}>
          <Checkbox onClick={() => onClickMergeOption()} />
        </CardButtonsContainer>
      );
    } else if (hovering) {
      return (
        <>
          <CardButtonsContainer position={Position.Bottom}>
            <SubActivityButton />
            <ChoiceButton />
            <WaitingButton />
            {mergeable && (
              <MergeButton onClick={() => onClickMergeButton(columnId)} />
            )}
          </CardButtonsContainer>
          <CardButtonsContainer position={Position.Top}>
            <SubActivityButton />
            <ChoiceButton />
            <WaitingButton />
          </CardButtonsContainer>
        </>
      );
    }
  };

  return (
    <div
      onMouseEnter={() => !props.dragging && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: "flex",
        justifyContent: "row",
      }}
    >
      <div
        className={`${styles.container} ${
          hovering && styles["container--hover"]
        }`}
        style={{ display: "flex" }}
      >
        <div
          onClick={() => props.data.handleClick()}
          className={`${styles.card} ${styles["card--subactivity"]}`}
          style={{
            filter:
              isDropTarget && isValidDropTarget
                ? "brightness(1.85)"
                : isValidDropTarget === false
                ? "brightness(0.85)"
                : "",
          }}
        >
          <div className={styles["card__description-container"]}>
            {name ? (
              <p className={styles.text}>{formatCanvasText(name, 70)}</p>
            ) : (
              <p className={`${styles.text} ${styles["text--placeholder"]}`}>
                {formatCanvasText(vsmObjectType.name, 70)}
              </p>
            )}
          </div>
          <div className={styles["card__role-container"]}>
            <p className={styles.text}>
              {formatCanvasText(role ?? "", 16, true)}
            </p>
          </div>
          <div className={styles["card__time-container"]}>
            <p className={styles.text}>
              {formatCanvasText(formatDuration(time, timeDefinition), 12, true)}
            </p>
          </div>
          <Handle
            className={styles.handle}
            type="target"
            position={Position.Top}
            isConnectable={false}
          />
          <Handle
            className={styles.handle}
            type="source"
            position={Position.Bottom}
            isConnectable={false}
          />
        </div>
        {tasks?.length > 0 && (
          <QIPRContainer
            onClick={() => props.data.handleClick(props.data.card)}
            tasks={tasks}
          />
        )}
      </div>
      {renderCardButtons()}
    </div>
  );
};
