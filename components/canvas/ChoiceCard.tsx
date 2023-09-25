import React, { useEffect, useState } from "react";
import { Connection, Handle, Position, useStore } from "reactflow";
import { formatCardText } from "./utils/FormatCardText";

import styles from "./Card.module.scss";
import stylesCardButtons from "./CardButtons.module.scss";
import { CardButtonsContainer } from "./CardButtonsContainer";
import { SubActivityButton } from "./SubActivityButton";
import { ChoiceButton } from "./ChoiceButton";
import { WaitingButton } from "./WaitingButton";
import { vsmObjectTypes } from "types/vsmObjectTypes";
import { MergeEndButton } from "./MergeEndButton";
import { MergeStartButton } from "./MergeStartButton";

export function ChoiceCard(props) {
  const [hovering, setHovering] = useState(false);
  const connectionNodeId = useStore((state) => state.connectionNodeId);

  const {
    id,
    description,
    type,
    isDropTarget,
    isValidDropTarget,
    handleClickCard,
    isChoiceChild,
    handleClickAddCard,
    userCanEdit,
    children,
    mergeOption,
    merging,
    handleConfirmMerge,
  } = props.data;

  const size = 132;
  const lastChild = children[children?.length - 1];

  useEffect(() => {
    setHovering(false);
  }, [props.dragging, connectionNodeId]);

  return (
    <div
      onMouseEnter={() => {
        !props.dragging && setHovering(true);
      }}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        onClick={() => handleClickCard()}
        className={`${hovering && !merging && styles["container--hover"]} ${
          styles[
            isDropTarget && isValidDropTarget
              ? "card--validDropTarget"
              : isValidDropTarget === false
              ? "card--invalidDropTarget"
              : ""
          ]
        }`}
      >
        <svg
          style={{ display: "block", overflow: "visible" }}
          width={size}
          height={size}
        >
          <path
            d={`M0,${size / 2} L${size / 2},0 L${size},${size / 2} L${
              size / 2
            },${size} z`}
            {...{ fill: "#FDD835" }}
          />
        </svg>
        <div
          style={{
            display: "flex",
            textAlign: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {description ? (
            <p
              style={{
                width: 90,
                marginLeft: 20,
                overflowWrap: "break-word",
              }}
              className={styles.text}
            >
              {formatCardText(description, 50)}
            </p>
          ) : (
            <p
              style={{ width: 100, marginLeft: 15 }}
              className={`${styles.text} ${styles["text--placeholder"]}`}
            >
              {formatCardText(type)}
            </p>
          )}
        </div>
        <MergeEndButton hidden={!mergeOption} />
        <Handle
          className={stylesCardButtons.handle}
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          isConnectableEnd={false}
        />
      </div>
      {hovering && userCanEdit && !merging && (
        <>
          <CardButtonsContainer position={Position.Bottom}>
            <SubActivityButton
              onClick={() =>
                handleClickAddCard(
                  lastChild || id,
                  vsmObjectTypes.subActivity,
                  lastChild ? Position.Right : Position.Bottom
                )
              }
            />
            <ChoiceButton
              onClick={() =>
                handleClickAddCard(
                  lastChild || id,
                  vsmObjectTypes.choice,
                  lastChild ? Position.Right : Position.Bottom
                )
              }
            />
            <WaitingButton
              onClick={() =>
                handleClickAddCard(
                  lastChild || id,
                  vsmObjectTypes.waiting,
                  lastChild ? Position.Right : Position.Bottom
                )
              }
            />
            <MergeStartButton
              onConnect={(e: Connection) =>
                handleConfirmMerge(e.source, e.target)
              }
            />
          </CardButtonsContainer>
          {/* <CardButtonsContainer position={Position.Top}>
            <SubActivityButton
              onClick={() => handleClickAddCard(parentCard.id, "SubActivity")}
            />
            <ChoiceButton
              onClick={() => handleClickAddCard(parentCard.id, "Choice")}
            />
            <WaitingButton
              onClick={() => handleClickAddCard(parentCard.id, "Waiting")}
            />
          </CardButtonsContainer> */}
          {isChoiceChild && (
            <>
              <CardButtonsContainer position={Position.Right}>
                <SubActivityButton
                  onClick={() =>
                    handleClickAddCard(
                      id,
                      vsmObjectTypes.subActivity,
                      Position.Right
                    )
                  }
                />
                <ChoiceButton
                  onClick={() =>
                    handleClickAddCard(
                      id,
                      vsmObjectTypes.choice,
                      Position.Right
                    )
                  }
                />
                <WaitingButton
                  onClick={() =>
                    handleClickAddCard(
                      id,
                      vsmObjectTypes.waiting,
                      Position.Right
                    )
                  }
                />
              </CardButtonsContainer>
              <CardButtonsContainer position={Position.Left}>
                <SubActivityButton
                  onClick={() =>
                    handleClickAddCard(
                      id,
                      vsmObjectTypes.subActivity,
                      Position.Left
                    )
                  }
                />
                <ChoiceButton
                  onClick={() =>
                    handleClickAddCard(id, vsmObjectTypes.choice, Position.Left)
                  }
                />
                <WaitingButton
                  onClick={() =>
                    handleClickAddCard(
                      id,
                      vsmObjectTypes.waiting,
                      Position.Left
                    )
                  }
                />
              </CardButtonsContainer>
            </>
          )}
        </>
      )}
    </div>
  );
}
