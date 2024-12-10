import { getNodeTypeName } from "@/utils/getNodeTypeName";
import {
  formatMinMaxTotalDuration,
  formatMinMaxTotalDurationShort,
} from "@/utils/unitDefinitions";
import { useEffect, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import colors from "theme/colors";
import { NodeDataCommon } from "types/NodeData";
import { NodeTypes } from "types/NodeTypes";
import { ChoiceButton } from "./ChoiceButton";
import { useIsEditingNode } from "./hooks/useIsEditingNode";
import { useNodeAdd } from "./hooks/useNodeAdd";
import { useQIPRContainerOnClick } from "./hooks/useQIPRContainerOnClick";
import { useShouldDisplayQIPR } from "./hooks/useShouldDisplayQIPR";
import { MainActivityButton } from "./MainActivityButton";
import stylesNodeButtons from "./NodeButtons.module.scss";
import { NodeButtonsContainer } from "./NodeButtonsContainer";
import { NodeCard } from "./NodeCard";
import { NodeDescription } from "./NodeDescription";
import { NodeDuration } from "./NodeDuration";
import { NodeShape } from "./NodeShape";
import { NodeTooltip } from "./NodeTooltip";
import { QIPRContainer } from "./QIPRContainer";
import { SourceHandle } from "./SourceHandle";
import { SubActivityButton } from "./SubActivityButton";
import { WaitingButton } from "./WaitingButton";

export const MainActivityNode = ({
  data,
  dragging,
  selected,
}: NodeProps<NodeDataCommon>) => {
  const {
    description,
    type,
    tasks,
    id,
    isValidDropTarget,
    isDropTarget,
    handleClickNode,
    userCanEdit,
    merging,
    shapeHeight,
    shapeWidth,
    totalDurations,
    disabled,
  } = data;
  const [hovering, setHovering] = useState(false);
  const [hoveringShape, setHoveringShape] = useState(false);
  const { addNode, isNodeButtonDisabled } = useNodeAdd();

  const { isEditingNode, editNodeData } = useIsEditingNode(selected, data);

  const handleQIPRContainerOnClick = useQIPRContainerOnClick(data);
  const shouldDisplayQIPR = useShouldDisplayQIPR(tasks, hovering, selected);

  const formattedDurationSum =
    totalDurations && formatMinMaxTotalDuration(totalDurations);
  const formattedDurationSumShort =
    totalDurations && formatMinMaxTotalDurationShort(totalDurations);

  useEffect(() => {
    setHovering(false);
    setHoveringShape(false);
  }, [dragging]);

  const renderNodeButtons = () => {
    if (hovering && userCanEdit && !merging)
      return (
        <>
          <NodeButtonsContainer position={Position.Left}>
            <MainActivityButton
              onClick={() =>
                addNode(id, { type: NodeTypes.mainActivity }, Position.Left)
              }
              disabled={isNodeButtonDisabled(id, Position.Left)}
            />
          </NodeButtonsContainer>
          <NodeButtonsContainer position={Position.Right}>
            <MainActivityButton
              onClick={() =>
                addNode(id, { type: NodeTypes.mainActivity }, Position.Right)
              }
              disabled={isNodeButtonDisabled(id, Position.Right)}
            />
          </NodeButtonsContainer>
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
          </NodeButtonsContainer>
        </>
      );
  };

  return (
    <div
      onMouseEnter={() => !disabled && !dragging && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <NodeCard
        onClick={handleClickNode}
        hovering={hovering && !merging && !isEditingNode}
        highlighted={isDropTarget && isValidDropTarget}
        disabled={disabled || isValidDropTarget === false}
        selected={selected}
      >
        <NodeShape
          shape={"square"}
          color={colors.NODE_MAINACTIVITY}
          width={shapeWidth}
          height={shapeHeight}
          onMouseEnter={() => !dragging && setHoveringShape(true)}
          onMouseLeave={() => setHoveringShape(false)}
        >
          <NodeDescription
            header={!description ? getNodeTypeName(type) : undefined}
            description={description}
          />
          {formattedDurationSumShort && (
            <NodeDuration duration={formattedDurationSumShort} />
          )}
        </NodeShape>
        {shouldDisplayQIPR && (
          <QIPRContainer tasks={tasks} onClick={handleQIPRContainerOnClick} />
        )}
      </NodeCard>
      <Handle
        className={stylesNodeButtons["handle--hidden"]}
        type="target"
        position={Position.Top}
        isConnectable={false}
      />
      <SourceHandle />
      <NodeTooltip
        isHovering={hoveringShape && (!!description || !!formattedDurationSum)}
        isEditing={isEditingNode}
        nodeData={data}
        includeDescription
        description={description}
        includeRole={false}
        includeDuration={false}
        includeEstimate
        estimate={formattedDurationSum}
        editNodeData={editNodeData}
      />
      {renderNodeButtons()}
    </div>
  );
};
