import React, { useEffect, useState } from "react";
import { Handle, Position } from "reactflow";
import { formatCanvasText } from "./utils/FormatCanvasText";
import { MainActivityButton } from "./MainActivityButton";
import { SubActivityButton } from "./SubActivityButton";
import { ChoiceButton } from "./ChoiceButton";
import { WaitingButton } from "./WaitingButton";
import { CardButtonsContainer } from "./CardButtonsContainer";

import styles from "./Card.module.scss";
import { QIPRContainer } from "./QIPRContainer";
import { NodeData } from "interfaces/NodeData";
import { Node } from "reactflow";

export function MainActivityCard(props: Node<NodeData>) {
  const [hovering, setHovering] = useState(false);

  const {
    card: { description, type, tasks, id },
    isValidDropTarget,
    isDropTarget,
    handleClickCard,
    handleClickAddCard,
    userCanEdit,
  } = props.data;

  useEffect(() => {
    setHovering(false);
  }, [props.dragging]);

  return (
    <div
      onMouseEnter={() => !props.dragging && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className={`${styles.container} ${
          hovering ? styles["container--hover"] : ""
        }`}
        style={{ display: "flex" }}
      >
        <div
          onClick={() => handleClickCard()}
          className={`${styles.card} ${styles["card--mainactivity"]} ${
            styles[
              isDropTarget && isValidDropTarget
                ? "card--validDropTarget"
                : isValidDropTarget === false
                ? "card--invalidDropTarget"
                : ""
            ]
          }`}
        >
          <div className={styles["card__description-container"]}>
            {description ? (
              <p className={styles.text}>{formatCanvasText(description, 70)}</p>
            ) : (
              <p className={`${styles.text} ${styles["text--placeholder"]}`}>
                {formatCanvasText(type, 70)}
              </p>
            )}
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
          <QIPRContainer onClick={() => handleClickCard()} tasks={tasks} />
        )}
      </div>
      {hovering && userCanEdit && (
        <>
          <CardButtonsContainer position={Position.Left}>
            <MainActivityButton
              onClick={() =>
                handleClickAddCard(id, "MainActivity", Position.Left)
              }
            />
          </CardButtonsContainer>
          <CardButtonsContainer position={Position.Right}>
            <MainActivityButton
              onClick={() =>
                handleClickAddCard(id, "MainActivity", Position.Right)
              }
            />
          </CardButtonsContainer>
          <CardButtonsContainer position={Position.Bottom}>
            <SubActivityButton
              onClick={() =>
                handleClickAddCard(id, "SubActivity", Position.Bottom)
              }
            />
            <ChoiceButton
              onClick={() => handleClickAddCard(id, "Choice", Position.Bottom)}
            />
            <WaitingButton
              onClick={() => handleClickAddCard(id, "Waiting", Position.Bottom)}
            />
          </CardButtonsContainer>
        </>
      )}
    </div>
  );
}
