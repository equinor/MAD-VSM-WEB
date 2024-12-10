import { getNodeTypeName } from "@/utils/getNodeTypeName";
import { formatDuration } from "@/utils/unitDefinitions";
import { useEffect, useState } from "react";
import { Connection, NodeProps, Position, useStore } from "reactflow";
import colors from "theme/colors";
import { NodeDataCommon } from "types/NodeData";
import { NodeTypes } from "types/NodeTypes";
import { ChoiceButton } from "./ChoiceButton";
import { MergeButton } from "./MergeButton";
import styles from "./Node.module.scss";
import { NodeButtonsContainer } from "./NodeButtonsContainer";
import { NodeCard } from "./NodeCard";
import { NodeDescription } from "./NodeDescription";
import { NodeDuration } from "./NodeDuration";
import { NodeShape } from "./NodeShape";
import { NodeTooltip } from "./NodeTooltip";
import { QIPRContainer } from "./QIPRContainer";
import { SourceHandle } from "./SourceHandle";
import { SubActivityButton } from "./SubActivityButton";
import { TargetHandle } from "./TargetHandle";
import { WaitingButton } from "./WaitingButton";
import { useIsEditingNode } from "./hooks/useIsEditingNode";
import { useNodeAdd } from "./hooks/useNodeAdd";
import { useQIPRContainerOnClick } from "./hooks/useQIPRContainerOnClick";
import { useShouldDisplayQIPR } from "./hooks/useShouldDisplayQIPR";
import { FormatNodeText } from "./utils/FormatNodeText";
import { isChoiceChild } from "./utils/nodeRelationsHelper";

export const SubActivityNode = ({
  data,
  dragging,
  selected,
}: NodeProps<NodeDataCommon>) => {
  const {
    description,
    role,
    duration,
    unit,
    type,
    tasks,
    id,
    isValidDropTarget,
    isDropTarget,
    merging,
    mergeOption,
    handleClickNode,
    handleMerge,
    parentTypes,
    userCanEdit,
    mergeable,
    shapeHeight,
    shapeWidth,
    disabled,
  } = data;
  const [hovering, setHovering] = useState(false);
  const [hoveringShape, setHoveringShape] = useState(false);
  const connectionNodeId = useStore((state) => state.connectionNodeId);
  const { addNode, isNodeButtonDisabled } = useNodeAdd();
  const { isEditingNode, editNodeData } = useIsEditingNode(selected, data);

  const handleQIPRContainerOnClick = useQIPRContainerOnClick(data);
  const shouldDisplayQIPR = useShouldDisplayQIPR(tasks, hovering, selected);

  useEffect(() => {
    setHovering(false);
    setHoveringShape(false);
  }, [dragging, connectionNodeId]);

  const renderNodeButtons = () => {
    if (userCanEdit && hovering && !merging) {
      return (
        <>
          <NodeButtonsContainer position={Position.Bottom}>
            <SubActivityButton
              onClick={() =>
                addNode(id, { type: NodeTypes.subActivity }, Position.Bottom)
              }
              disabled={isNodeButtonDisabled(id, Position.Bottom)}
            />
            <ChoiceButton
              onClick={() =>
                addNode(id, { type: NodeTypes.choice }, Position.Bottom)
              }
              disabled={isNodeButtonDisabled(id, Position.Bottom)}
            />
            <WaitingButton
              onClick={() =>
                addNode(id, { type: NodeTypes.waiting }, Position.Bottom)
              }
              disabled={isNodeButtonDisabled(id, Position.Bottom)}
            />
            {mergeable && handleMerge && (
              <MergeButton
                onConnect={(e: Connection) => handleMerge(e.source, e.target)}
              />
            )}
          </NodeButtonsContainer>
          {isChoiceChild(parentTypes) && (
            <>
              <NodeButtonsContainer position={Position.Right}>
                <SubActivityButton
                  onClick={() =>
                    addNode(id, { type: NodeTypes.subActivity }, Position.Right)
                  }
                  disabled={isNodeButtonDisabled(id, Position.Right)}
                />
                <ChoiceButton
                  onClick={() =>
                    addNode(id, { type: NodeTypes.choice }, Position.Right)
                  }
                  disabled={isNodeButtonDisabled(id, Position.Right)}
                />
                <WaitingButton
                  onClick={() =>
                    addNode(id, { type: NodeTypes.waiting }, Position.Right)
                  }
                  disabled={isNodeButtonDisabled(id, Position.Right)}
                />
              </NodeButtonsContainer>
              <NodeButtonsContainer position={Position.Left}>
                <SubActivityButton
                  onClick={() =>
                    addNode(id, { type: NodeTypes.subActivity }, Position.Left)
                  }
                  disabled={isNodeButtonDisabled(id, Position.Left)}
                />
                <ChoiceButton
                  onClick={() =>
                    addNode(id, { type: NodeTypes.choice }, Position.Left)
                  }
                  disabled={isNodeButtonDisabled(id, Position.Left)}
                />
                <WaitingButton
                  onClick={() =>
                    addNode(id, { type: NodeTypes.waiting }, Position.Left)
                  }
                  disabled={isNodeButtonDisabled(id, Position.Left)}
                />
              </NodeButtonsContainer>
            </>
          )}
        </>
      );
    }
  };

  return (
    <div
      onMouseEnter={() => !disabled && !dragging && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <NodeCard
        onClick={handleClickNode}
        hovering={hovering && !merging}
        highlighted={isDropTarget && isValidDropTarget}
        disabled={disabled || isValidDropTarget === false}
        selected={selected}
      >
        <NodeShape
          shape={"square"}
          color={colors.NODE_SUBACTIVITY}
          width={shapeWidth}
          height={shapeHeight}
          onMouseEnter={() => !dragging && setHoveringShape(true)}
          onMouseLeave={() => setHoveringShape(false)}
        >
          <NodeDescription
            header={!description ? getNodeTypeName(type) : undefined}
            description={description}
          />
          <div className={styles["node__role-container"]}>
            <FormatNodeText
              variant="caption"
              className={styles["node__info-text"]}
            >
              {role}
            </FormatNodeText>
          </div>
          <NodeDuration duration={formatDuration(duration, unit)} />
        </NodeShape>
        {shouldDisplayQIPR && (
          <QIPRContainer tasks={tasks} onClick={handleQIPRContainerOnClick} />
        )}
      </NodeCard>
      <TargetHandle hidden={!mergeOption} />
      <SourceHandle />
      <NodeTooltip
        isHovering={
          hoveringShape &&
          (!!description || !!role || typeof duration === "number")
        }
        isEditing={isEditingNode}
        nodeData={data}
        includeDescription
        description={description}
        includeRole
        role={role ?? undefined}
        includeDuration
        duration={formatDuration(duration, unit)}
        includeEstimate={false}
        editNodeData={editNodeData}
      />
      {renderNodeButtons()}
    </div>
  );
};
