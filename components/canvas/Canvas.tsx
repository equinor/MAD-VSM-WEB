import "reactflow/dist/style.css";
import React, { useEffect, useRef, useState } from "react";
import { moveVSMObject, postVSMObject } from "../../services/vsmObjectApi";
import { useAccount, useMsal } from "@azure/msal-react";
import { useMutation, useQueryClient } from "react-query";

import { DeleteVsmObjectDialog } from "../DeleteVsmObjectDialog";
import { LiveIndicator } from "../LiveIndicator";
import { ResetProcessButton } from "components/ResetProcessButton";
import { ToBeToggle } from "./ToBeToggle";
import { VSMSideBar } from "../VSMSideBar";
import { getMyAccess } from "../../utils/getMyAccess";
import { notifyOthers } from "../../services/notifyOthers";
import { CanvasButtons } from "components/CanvasButtons";
import ManageLabelBox from "components/Labels/ManageLabelBox";
import { unknownErrorToString } from "utils/isError";
import { useRouter } from "next/router";
import { useStoreDispatch } from "../../hooks/storeHooks";
import { vsmObject } from "interfaces/VsmObject";
import { Button, Icon } from "@equinor/eds-core-react";
import { close } from "@equinor/eds-icons";
import { ProcessTimeline } from "../ProcessTimeline";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Edge,
  Node,
} from "reactflow";
import useLayout from "./hooks/useLayout";
import nodeTypes from "./NodeTypes";
import { vsmObjectTypes } from "types/vsmObjectTypes";
import { NodeData } from "interfaces/NodeData";

function Canvas(props): JSX.Element {
  const [selectedObject, setSelectedObject] = useState<vsmObject>(null);
  const dispatch = useStoreDispatch();
  const router = useRouter();
  const { id, version } = router.query;
  const { project } = props;

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketReason, setSocketReason] = useState("");

  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const rootNode: Node = {
    id: project.objects[0].vsmObjectID.toString(),
    data: {},
    position: { x: 0, y: 0 },
    type: "rootCard",
  };

  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([rootNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [visibleDeleteScrim, setVisibleDeleteScrim] = useState(false);
  const [visibleLabelScrim, setVisibleLabelScrim] = useState(false);
  const myAccess = getMyAccess(project, account);
  const userCanEdit = !version && myAccess !== "Reader";

  const queryClient = useQueryClient();
  const vsmObjectMutation = useMutation(
    (newObject: vsmObject) => {
      dispatch.setSnackMessage("⏳ Moving card...");
      return moveVSMObject(newObject);
    },
    {
      onSuccess: () => {
        dispatch.setSnackMessage("✅ Moved card!");
        notifyOthers("Moved a card", id, account);
        return queryClient.invalidateQueries();
      },
      onError: (e) => dispatch.setSnackMessage(unknownErrorToString(e)),
    }
  );
  const vsmObjectAddMutation = useMutation(
    (newObject: vsmObject) => {
      dispatch.setSnackMessage("⏳ Adding new card...");
      return postVSMObject(newObject);
    },
    {
      onSuccess: () => {
        dispatch.setSnackMessage("✅ Card added!");
        notifyOthers("Added a new card", id, account);
        return queryClient.invalidateQueries();
      },
      onError: (e) => dispatch.setSnackMessage(unknownErrorToString(e)),
    }
  );
  const projectId = router.query.id as string;
  const [showVersionHistoryBottomSheet, setShowVersionHistoryBottomSheet] =
    React.useState(!!router.query.version);

  function goToCurrentVersion(): void {
    // navigate back to current version
    router.replace(`/process/${projectId}`);
  }

  function closeVersionHistoryBottomSheet(): void {
    setShowVersionHistoryBottomSheet(false);
    goToCurrentVersion();
  }

  const getCardById = (id: number): vsmObject =>
    project.objects.find((vsmObj: vsmObject) => vsmObj.vsmObjectID === id);

  let nodesToMerge: string[] = [];

  const handleMergeClick = (columnId: number, nodeId: string): void => {
    nodesToMerge = [];
    nodesToMerge.push(nodeId);
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id == nodeId) {
          node.data = { ...node.data, mergeInitiator: true };
        } else if (node.data.columnId == columnId && node.data.mergeable) {
          node.data = { ...node.data, mergeOption: true };
        } else {
          node.data = {
            ...node.data,
            mergeInitiator: false,
            mergeOption: false,
          };
        }
        return node;
      })
    );
  };

  const handleCancelMerge = (columnId: number, nodeId: string): void => {
    nodesToMerge = [];
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id == nodeId) {
          node.data = { ...node.data, mergeInitiator: false };
        } else if (node.data.columnId == columnId) {
          node.data = { ...node.data, mergeOption: false };
        }
        return node;
      })
    );
  };

  const handleMergeOption = (vsmObjectID: string): void => {
    nodesToMerge.includes(vsmObjectID)
      ? nodesToMerge.splice(nodesToMerge.indexOf(vsmObjectID), 1)
      : nodesToMerge.push(vsmObjectID);
  };

  const handleConfirmMerge = (vsmObjectType: string): void => {
    console.log(vsmObjectType);
    console.log(nodesToMerge);
    console.log("MERGE");
    nodesToMerge = [];
  };

  let columnId: number = null;

  const addCardChildren = (
    card: vsmObject,
    cbNode: (x: Node<NodeData>) => void,
    cbEdge: (x: Edge) => void,
    parentCard: vsmObject = null
  ): void => {
    if (parentCard) {
      if (
        card.vsmObjectType.pkObjectType === vsmObjectTypes.mainActivity ||
        card.vsmObjectType.pkObjectType === vsmObjectTypes.output ||
        card.vsmObjectType.pkObjectType === vsmObjectTypes.supplier ||
        card.vsmObjectType.pkObjectType === vsmObjectTypes.input ||
        card.vsmObjectType.pkObjectType === vsmObjectTypes.customer
      ) {
        columnId = card.vsmObjectID;
      }
      cbNode({
        id: card.vsmObjectID.toString(),
        data: {
          card,
          handleClick: () => setSelectedObject(card),
          onClickMergeButton: (columnId: number) =>
            handleMergeClick(columnId, card.vsmObjectID.toString()),
          onClickMergeOption: () =>
            handleMergeOption(card.vsmObjectID.toString()),
          confirmMerge: (vsmObjectType) => handleConfirmMerge(vsmObjectType),
          cancelMerge: (columnId) =>
            handleCancelMerge(columnId, card.vsmObjectID.toString()),
          mergeable: card.childObjects.length === 0,
          columnId,
        },
        position: { x: 0, y: 0 },
        type: card.vsmObjectType.pkObjectType.toString(),
        extent: "parent",
      });

      cbEdge({
        id: `${parentCard.vsmObjectID}=>${card.vsmObjectID}`,
        source: parentCard.vsmObjectID.toString(),
        target: card.vsmObjectID.toString(),
      });
    }

    card.childObjects.forEach((childCardId) => {
      const childCard = getCardById(childCardId);
      addCardChildren(childCard, cbNode, cbEdge, card);
    });
  };

  useEffect(() => {
    const initNodes: Node<NodeData>[] = [];
    const initEdges: Edge[] = [];
    addCardChildren(
      project.objects[0],
      (node) => {
        initNodes.push(node);
      },
      (edge) => {
        initEdges.push(edge);
      }
    );
    setNodes([rootNode, ...initNodes]);
    setEdges(initEdges);
  }, [project]);

  const dragRef = useRef<Node<NodeData>>(null);
  const [target, setTarget] = useState<Node<NodeData>>(null);
  const [source, setSource] = useState<Node<NodeData>>(null);

  const isValidDrop = (
    source: Node<NodeData>,
    target: Node<NodeData>
  ): boolean => {
    const sourceType = source.type;
    const targetType = target.type;
    return (
      ((sourceType === "10" || sourceType === "5" || sourceType === "7") &&
        (targetType === "10" ||
          targetType === "5" ||
          targetType === "7" ||
          targetType === "4")) ||
      (sourceType === "4" && targetType === "4")
    );
  };

  const onNodeDragStart = (
    evt: React.MouseEvent<Element, MouseEvent>,
    nodeDragging: Node<NodeData>
  ): void => {
    // TODO: Drag children aswell
    dragRef.current = nodeDragging;
    setNodes((nodes) =>
      nodes.map((node) => {
        if (isValidDrop(nodeDragging, node)) {
          node.data = { ...node.data, isValidDropTarget: true };
        } else {
          node.data = { ...node.data, isValidDropTarget: false };
        }
        return node;
      })
    );
    setSource(nodeDragging);
  };

  const onNodeDrag = (
    evt: React.MouseEvent<Element, MouseEvent>,
    node: Node<NodeData>
  ): void => {
    // Check edges instead?
    const centerX = node.position.x + node.width / 2;
    const centerY = node.position.y + node.height / 2;

    const targetNode = nodes.find(
      (n) =>
        centerX > n.position.x &&
        centerX < n.position.x + 130 &&
        centerY > n.position.y &&
        centerY < n.position.y + 140 &&
        n.id !== node.id
    );

    setTarget(targetNode);
  };

  useEffect(() => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === target?.id && isValidDrop(node, target)) {
          node.data = { ...node.data, isDropTarget: true };
        } else {
          node.data = { ...node.data, isDropTarget: false };
        }
        return node;
      })
    );
  }, [target]);

  const onNodeDragStop = (
    evt: React.MouseEvent<Element, MouseEvent>,
    node: Node<NodeData>
  ): void => {
    if (!target || !isValidDrop(node, target)) {
      setNodes((nodes) =>
        nodes.map((n) => {
          if (n.id === node?.id) {
            n = source;
          }
          return n;
        })
      );
    } else {
      setTarget(null);
      dragRef.current = null;
    }
    setNodes((nodes) =>
      nodes.map((node) => {
        node.data = { ...node.data, isValidDropTarget: null };
        return node;
      })
    );
  };

  useLayout();

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {showVersionHistoryBottomSheet && (
        <div
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: "0",
            zIndex: 1,
            width: "100%",
          }}
        >
          <Button
            style={{
              position: "absolute",
              right: "0",
              top: "0",
            }}
            variant={"ghost_icon"}
            onClick={closeVersionHistoryBottomSheet}
          >
            <Icon data={close} />
          </Button>
          <ProcessTimeline processId={projectId} />
        </div>
      )}

      <CanvasButtons
        userCanEdit={userCanEdit}
        handleClickLabel={() => setVisibleLabelScrim(true)}
        handleClickVersionHistory={() => setShowVersionHistoryBottomSheet(true)}
      />
      <ManageLabelBox
        handleClose={() => setVisibleLabelScrim(false)}
        isVisible={visibleLabelScrim}
        process={project}
      />
      <LiveIndicator
        live={socketConnected}
        title={
          !!socketConnected
            ? "Connection is looking good!\nYour changes should appear immediately for other users."
            : `You are not connected ${
                socketReason ? `because of ${socketReason}` : ""
              }.`
        }
      />
      <ToBeToggle />
      <ResetProcessButton />
      <DeleteVsmObjectDialog
        objectToDelete={selectedObject}
        visible={visibleDeleteScrim}
        onClose={() => {
          setVisibleDeleteScrim(false);
          setSelectedObject(null);
        }}
      />
      <VSMSideBar
        onClose={() => setSelectedObject(null)}
        onDelete={() => setVisibleDeleteScrim(true)}
        canEdit={userCanEdit}
        selectedObject={selectedObject}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={() => setSelectedObject(null)}
        minZoom={0.2}
        nodesDraggable={true}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        attributionPosition="top-left"
      />
    </div>
  );
}

export function CanvasWrapper(props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
