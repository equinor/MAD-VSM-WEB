import { formatDuration } from "@/utils/unitDefinitions";
import { Icon, Typography } from "@equinor/eds-core-react";
import { time as timeIcon } from "@equinor/eds-icons";
import { useEffect, useState } from "react";
import { Connection, Position, useStore } from "reactflow";

import { getNodeTypeName } from "@/utils/getNodeTypeName";
import { NodeProps } from "reactflow";
import colors from "theme/colors";
import { NodeDataCommon } from "types/NodeData";
import { NodeTypes } from "types/NodeTypes";
import { ChoiceButton } from "./ChoiceButton";
import { MergeButton } from "./MergeButton";
import styles from "./Node.module.scss";
import { NodeButtonsContainer } from "./NodeButtonsContainer";
import { NodeCard } from "./NodeCard";
import { NodeDescription } from "./NodeDescription";
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
import { isChoiceChild } from "./utils/nodeRelationsHelper";

export const WaitingNode = ({
  data,
  dragging,
  selected,
}: NodeProps<NodeDataCommon>) => {
  const {
    description,
    id,
    duration,
    unit,
    type,
    tasks,
    isValidDropTarget,
    isDropTarget,
    mergeable,
    mergeOption,
    handleClickNode,
    handleMerge,
    merging,
    parentTypes,
    userCanEdit,
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
          color={colors.NODE_WAITING}
          width={shapeWidth}
          height={shapeHeight}
          onMouseEnter={() => !dragging && setHoveringShape(true)}
          onMouseLeave={() => setHoveringShape(false)}
        >
          <NodeDescription
            header={!description ? getNodeTypeName(type) : undefined}
            description={description}
          />
          <div className={styles["node__waitingtime-container"]}>
            <Icon data={timeIcon} size={24} style={{ marginRight: 5 }} />
            <Typography variant="caption">
              {formatDuration(duration, unit)}
            </Typography>
          </div>
        </NodeShape>
        {shouldDisplayQIPR && (
          <QIPRContainer tasks={tasks} onClick={handleQIPRContainerOnClick} />
        )}
      </NodeCard>
      <TargetHandle hidden={!mergeOption} />
      <SourceHandle />
      <NodeTooltip
        isHovering={
          hoveringShape && (!!description || typeof duration === "number")
        }
        isEditing={isEditingNode}
        nodeData={data}
        includeDescription
        description={description}
        includeRole={false}
        includeDuration
        duration={formatDuration(duration, unit)}
        includeEstimate={false}
        editNodeData={editNodeData}
      />
      {renderNodeButtons()}
    </div>
  );
};
