import { NodeDataCommon } from "@/types/NodeData";
import { ChangeEvent } from "react";
import { DurationComponent } from "../DurationComponent";
import { useNodeUpdate } from "./hooks/useNodeUpdate";
import { NodeInput } from "./NodeInput";
import styles from "./NodeTooltipSection.module.scss";
import { FormatNodeText } from "./utils/FormatNodeText";
import dynamic from "next/dynamic";

const MarkdownEditor = dynamic(() => import("components/MarkdownEditor"), {
  ssr: false,
});

type EditableNodeTooltipSectionProps = {
  header?: string;
  text?: string;
  isEditing?: boolean;
  variant: "description" | "duration" | "role";
  nodeData: NodeDataCommon;
  editNodeData: NodeDataCommon | undefined;
};

export const EditableNodeTooltipSection = ({
  header,
  text,
  isEditing,
  variant = "description",
  nodeData,
  editNodeData,
}: EditableNodeTooltipSectionProps) => {
  const { patchDescription, patchDuration, patchRole } =
    useNodeUpdate(nodeData);

  const shouldDisplayHeader = !(
    isEditing &&
    (variant === "duration" || variant === "description")
  );

  const renderInput = () => {
    switch (variant) {
      case "duration":
        return (
          <DurationComponent
            selectedNode={editNodeData}
            onChangeDuration={({ duration, unit }) =>
              patchDuration(duration, unit)
            }
            disabled={!nodeData.userCanEdit}
          />
        );
      case "role":
        return (
          <NodeInput
            initialValue={editNodeData?.role}
            id={`${nodeData.id}-role`}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              patchRole(e.target.value)
            }
            disabled={!nodeData.userCanEdit}
          />
        );
      case "description":
        return (
          <MarkdownEditor
            canEdit={nodeData.userCanEdit}
            defaultText={editNodeData?.description || ""}
            label={"Description"}
            onChange={patchDescription}
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      {shouldDisplayHeader && (
        <FormatNodeText variant="meta" color="Gray">
          {header}
        </FormatNodeText>
      )}
      {isEditing ? (
        renderInput()
      ) : (
        <FormatNodeText variant="body_long">{text}</FormatNodeText>
      )}
    </div>
  );
};
