import { NodeDataCommon } from "@/types/NodeData";
import { useCanvasType } from "./useCanvasType";
import { useEffect, useState } from "react";

export const useIsEditingNode = (selected: boolean, data: NodeDataCommon) => {
  const [editNodeData, seteditNodeData] = useState<NodeDataCommon | undefined>(
    undefined
  );
  const canvasType = useCanvasType();
  const isEditingNode = canvasType === "main" && selected;
  useEffect(() => {
    if (isEditingNode) {
      seteditNodeData(data);
    }
  }, [isEditingNode]);
  return {
    editNodeData,
    seteditNodeData,
    isEditingNode,
  };
};
