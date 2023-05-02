/* eslint-disable @typescript-eslint/ban-ts-comment */
import "reactflow/dist/style.css";
import React, { useEffect, useRef, useState } from "react";
import { useAccount, useMsal } from "@azure/msal-react";
import { useMutation, useQueryClient } from "react-query";

import { getAccessToken } from "../../auth/msalHelpers";
import { DeleteVsmObjectDialog } from "../DeleteVsmObjectDialog";
import { LiveIndicator } from "../LiveIndicator";
import { io } from "socket.io-client";
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
  useReactFlow,
  Position,
  Controls,
} from "reactflow";
import { setLayout } from "./hooks/useLayout";
import { nodeTypes } from "./NodeTypes";
import { NodeData } from "interfaces/NodeData";
import {
  moveVertice,
  addVertice,
  addVerticeLeft,
  addVerticeRight,
  addVerticeMultipleParents,
} from "../../services/graphApi";
import { vsmObjectTypes } from "types/vsmObjectTypes";

function Canvas(props): JSX.Element {
  const [selectedObject, setSelectedObject] = useState<vsmObject>(null);
  const dispatch = useStoreDispatch();
  const router = useRouter();
  const { id, version } = router.query;
  const { project, graph } = props;

  const [socketConnected, setSocketConnected] = useState(false);
  const [socketReason, setSocketReason] = useState("");

  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const rootNode: Node = {
    id: graph.find((card: vsmObject) => card.type === "Root").id,
    data: {},
    position: { x: 0, y: 0 },
    width: 0,
    height: 0,
    type: "Root",
    hidden: true,
  };

  const rfInstance = useReactFlow();
  const initNodes: Node<NodeData>[] = [];
  const initEdges: Edge[] = [];
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([rootNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodesToMerge, setNodesToMerge] = useState([]);

  const [visibleDeleteScrim, setVisibleDeleteScrim] = useState(false);
  const [visibleLabelScrim, setVisibleLabelScrim] = useState(false);
  const myAccess = getMyAccess(project, account);
  const userCanEdit = !version && myAccess !== "Reader";

  const queryClient = useQueryClient();
  const projectId = router.query.id as string;
  const [showVersionHistoryBottomSheet, setShowVersionHistoryBottomSheet] =
    React.useState(!!router.query.version);

  useEffect(() => {
    getAccessToken().then((accessToken) => {
      const socket = io({ path: "/api/socket", auth: { token: accessToken } });

      socket.on("connect", () => {
        setSocketConnected(true);
      });

      socket.on("disconnect", (reason) => {
        dispatch.setSnackMessage(`Socket disconnected because ${reason}`);
        setSocketConnected(false);
        setSocketReason(`${reason}`);
      });

      socket.on("connect_error", (error) => {
        // if (error.data.type === "UnauthorizedError") {
        console.log("Error", error);
        setSocketConnected(false);
        setSocketReason(error.message);
        // }
      });

      socket.on(`room-${id}`, (payload) => {
        if (payload.user !== account.username?.split("@")[0]) {
          dispatch.setSnackMessage(
            `${payload.user ? payload.user : "Someone"} ${payload.msg}`
          );
        }
        queryClient.invalidateQueries();
      });
      // Handling token expiration

      return () => socket.disconnect();
    });
  }, []);

  function goToCurrentVersion(): void {
    // navigate back to current version
    router.replace(`/process/${projectId}`);
  }

  function closeVersionHistoryBottomSheet(): void {
    setShowVersionHistoryBottomSheet(false);
    goToCurrentVersion();
  }

  const getCardById = (id: string): vsmObject =>
    graph.find((card: vsmObject) => card.id === id);

  const handleClickMergeInit = (columnId: string, nodeId: string): void => {
    setNodesToMerge([nodeId]);
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

  const handleClickCancelMerge = (columnId: string, nodeId: string): void => {
    setNodesToMerge([]);
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

  const handleClickMergeOptionCheckbox = (vsmObjectID: string): void => {
    nodesToMerge.includes(vsmObjectID)
      ? setNodesToMerge((oldState) => [
          ...oldState,
          oldState.splice(nodesToMerge.indexOf(vsmObjectID), 1),
        ])
      : setNodesToMerge((oldArray) => [...oldArray, vsmObjectID]);
  };

  const handleClickConfirmMerge = useMutation(
    ({ type }: { type: string }) => {
      dispatch.setSnackMessage("⏳ Merging cards...");
      return addVerticeMultipleParents(
        { type, parents: nodesToMerge },
        projectId
      );
    },
    {
      onSuccess: () => {
        dispatch.setSnackMessage("✅ Cards merged!");
        notifyOthers("Added a new card", id, account);
        return queryClient.invalidateQueries();
      },
      onError: (e) => dispatch.setSnackMessage(unknownErrorToString(e)),
    }
  );

  const handleClickAddCard = useMutation(
    ({
      parentId,
      type,
      position,
    }: {
      parentId: string;
      type: string;
      position: Position;
    }) => {
      dispatch.setSnackMessage("⏳ Adding new card...");
      switch (position) {
        case Position.Bottom:
          return addVertice({ type }, projectId, parentId);
        case Position.Left:
          return addVerticeLeft({ type }, projectId, parentId);
        case Position.Right:
          return addVerticeRight({ type }, projectId, parentId);
      }
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

  const handleMoveCard = useMutation(
    ({ cardId, parentId }: { cardId: string; parentId: string }) => {
      dispatch.setSnackMessage("⏳ Moving card...");
      return moveVertice(
        { vertexToMoveId: cardId, vertexDestinationParentId: parentId },
        projectId
      );
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

  let columnId: string = null;

  const addCardsToCanvas = (
    card: vsmObject,
    cbAddNode: (x: Node<NodeData>) => void,
    cbAddEdge: (x: Edge) => void,
    parentCard: vsmObject = null
  ): void => {
    if (parentCard) {
      if (
        card.type === "MainActivity" ||
        card.type === "Output" ||
        card.type === "Supplier" ||
        card.type === "Input" ||
        card.type === "Customer"
      ) {
        columnId = card.id;
      }
      cbAddEdge({
        id: `${parentCard.id}=>${card.id}`,
        source: parentCard.id,
        target: card.id,
        // hidden: parentCard.type !== "Choice",
      });

      if (initNodes.find((node) => node.id === card.id)) {
        return;
      }

      cbAddNode({
        id: card.id,
        data: {
          card,
          handleClickCard: () => setSelectedObject(card),
          handleClickAddCard: (id, type, position) =>
            // @ts-ignore
            handleClickAddCard.mutate({ parentId: id, type, position }),
          handleClickMergeInit: (columnId) =>
            handleClickMergeInit(columnId, card.id),
          handleClickMergeOptionCheckbox: () =>
            handleClickMergeOptionCheckbox(card.id),
          handleClickConfirmMerge: (type) =>
            handleClickConfirmMerge.mutate({ type }),
          handleClickCancelMerge: (columnId) =>
            handleClickCancelMerge(columnId, card.id),
          mergeable: card.children.length === 0,
          columnId,
          userCanEdit,
        },
        position: { x: 0, y: 0 },
        type: card.type,
        width:
          200 + // 200 = base card width
          (card?.tasks?.length > 0
            ? (((card?.tasks?.length / 4) >> 0) + 1) * 33 + 2.5 // 33 = QIPR circle width. 2.5 = margin
            : 0),
        height: 200,
      });
    }

    card.children.forEach((childCardId) => {
      const childCard = getCardById(childCardId);
      addCardsToCanvas(childCard, cbAddNode, cbAddEdge, card);
    });
  };

  useEffect(() => {
    if (graph) {
      if (selectedObject)
        setSelectedObject(graph.find((node) => node.id === selectedObject.id));
      addCardsToCanvas(
        graph.find((card: vsmObject) => card.type === "Root"),
        (node) => {
          initNodes.push(node);
        },
        (edge) => {
          initEdges.push(edge);
        }
      );
      const finalNodes = setLayout([rootNode, ...initNodes], initEdges);
      setNodes(finalNodes);
      setEdges(initEdges);
      rfInstance.fitView({ includeHiddenNodes: false, duration: 200 });
    }
  }, [graph]);

  const dragRef = useRef<Node<NodeData>>(null);
  const [target, setTarget] = useState<Node<NodeData>>(null);
  const [source, setSource] = useState<Node<NodeData>>(null);

  const isValidDrop = (
    source: Node<NodeData>,
    target: Node<NodeData>
  ): boolean => {
    const sourceType = source.type;
    const targetType = target.type;
    const targetIsParent = source?.data?.parentCards?.find(
      (parentCard) => parentCard.id === target.id
    );
    return (
      !targetIsParent &&
      (((sourceType === vsmObjectTypes.choice ||
        sourceType === vsmObjectTypes.subActivity ||
        sourceType === vsmObjectTypes.waiting) &&
        (targetType === vsmObjectTypes.choice ||
          targetType === vsmObjectTypes.subActivity ||
          targetType === vsmObjectTypes.waiting ||
          targetType === vsmObjectTypes.mainActivity)) ||
      (sourceType === vsmObjectTypes.mainActivity &&
          targetType === vsmObjectTypes.mainActivity))
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
      // @ts-ignore
      handleMoveCard.mutate({ cardId: node.id, parentId: target.id });
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

  return (
    <div
      style={{
        width: "100vw",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
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
            : `You are not connected${
                // eslint-disable-next-line sonarjs/no-nested-template-literals
                socketReason ? ` because of ${socketReason}` : ""
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
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={() => setSelectedObject(null)}
        minZoom={0.2}
        nodesDraggable={userCanEdit}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        attributionPosition="top-left"
        fitView
        fitViewOptions={{ includeHiddenNodes: true }}
      >
        <Controls
          showInteractive={false}
          fitViewOptions={{ includeHiddenNodes: true }}
        />
      </ReactFlow>
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
