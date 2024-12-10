import { NodeDataCommon } from "@/types/NodeData";
import { ReactNode } from "react";
import { NodeToolbar, NodeToolbarProps, Position } from "reactflow";
import { EditableNodeTooltipSection } from "./EditableNodeTooltipSection";
import styles from "./NodeTooltip.module.scss";

type NodeTooltipContainerProps = {
  children: ReactNode;
  isVisible?: boolean;
  position?: Position;
  style?: NodeToolbarProps["style"];
};

export const NodeTooltipContainer = ({
  children,
  isVisible,
  position,
  style,
}: NodeTooltipContainerProps) => {
  return (
    <NodeToolbar
      position={position}
      isVisible={isVisible}
      className={styles.container}
      onMouseDownCapture={(e) => e.stopPropagation()}
      style={style}
    >
      {children}
    </NodeToolbar>
  );
};

type Field<IncludeKey extends string, Key extends string> =
  | ({
      [k in IncludeKey]?: false;
    } & {
      [k in Key]?: undefined;
    })
  | ({
      [k in IncludeKey]: true;
    } & {
      [k in Key]: string | undefined;
    });

type NodeTooltipProps = Pick<NodeTooltipContainerProps, "position"> & {
  nodeData: NodeDataCommon;
  isHovering?: boolean;
  isEditing?: boolean;
  editNodeData: NodeDataCommon | undefined;
} & Field<"includeDescription", "description"> &
  Field<"includeDuration", "duration"> &
  Field<"includeEstimate", "estimate"> &
  Field<"includeRole", "role">;

export const NodeTooltip = ({
  includeDescription,
  includeDuration,
  includeEstimate,
  includeRole,
  description,
  role,
  duration,
  estimate,
  isHovering,
  isEditing,
  position,
  nodeData,
  editNodeData,
}: NodeTooltipProps) => {
  const editingStyle = { minWidth: "300px" };
  const tooltipStyle = isEditing ? editingStyle : undefined;
  const shouldDisplayDescription =
    includeDescription && (isEditing || description);
  const shouldDisplayRole = includeRole && (isEditing || role);
  const shouldDisplayDuration = includeDuration && (isEditing || duration);
  const shouldDisplayEstimate = includeEstimate && estimate;
  return (
    <NodeTooltipContainer
      isVisible={isHovering || isEditing}
      position={position}
      style={tooltipStyle}
    >
      {shouldDisplayDescription && (
        <EditableNodeTooltipSection
          nodeData={nodeData}
          header={"Description"}
          text={description}
          variant="description"
          isEditing={isEditing}
          editNodeData={editNodeData}
        />
      )}
      {shouldDisplayRole && (
        <EditableNodeTooltipSection
          nodeData={nodeData}
          header={"Role(s)"}
          text={role}
          variant="role"
          isEditing={isEditing}
          editNodeData={editNodeData}
        />
      )}
      {shouldDisplayDuration && (
        <EditableNodeTooltipSection
          header={"Duration"}
          variant="duration"
          nodeData={nodeData}
          text={duration}
          isEditing={isEditing}
          editNodeData={editNodeData}
        />
      )}
      {shouldDisplayEstimate && (
        <EditableNodeTooltipSection
          header={"Duration"}
          text={estimate}
          variant="duration"
          nodeData={nodeData}
          editNodeData={editNodeData}
        />
      )}
    </NodeTooltipContainer>
  );
};
