import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Application, Container, Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { isMobile } from "react-device-detect";
import { vsmObjectFactory } from "./canvas/VsmObjectFactory";
import { useStoreDispatch, useStoreState } from "../hooks/storeHooks";
import { debounce } from "../utils/debounce";
import { vsmObject } from "../interfaces/VsmObject";
import { VSMSideBar } from "./VSMSideBar";
import { GenericPostit } from "./canvas/GenericPostit";
import { vsmObjectTypes } from "../types/vsmObjectTypes";
import { uid } from "../utils/uuid";
import style from "./VSMCanvas.module.scss";

export const defaultObject = {
  name: "",
  vsmObjectType: { name: "", pkObjectType: 0 },
  vsmObjectID: 0,
  time: 0,
  role: "",
} as vsmObject;

const app: Application = new Application({
  // resizeTo: window,
  height: window.innerHeight - 70,
  width: window.innerWidth,
  backgroundColor: 0xf7f7f7,
  antialias: true,
});

const viewport: Viewport = new Viewport({
  interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
});

function initCanvas(ref: React.MutableRefObject<HTMLDivElement>) {
  // Make sure the app.stage is empty
  app.stage.removeChildren();
  ////////////////////////////////
  // add the viewport to the stage
  app.stage.addChild(viewport);

  if (isMobile) {
    viewport
      .drag()
      .pinch() // This doesn't work that well on desktop.
      .wheel()
      .decelerate({ friction: 0.4 });
  } else
    viewport
      // .pinch() // This doesn't work that well on desktop.
      .drag()
      .wheel()
      .decelerate({ friction: 0.4 });

  // Add app to DOM
  ref.current.appendChild(app.view);

  app?.start();

  console.info("Initialized canvas");
}

function getViewPort() {
  return viewport;
}

function cleanupApp() {
  // Todo: Fix cleanup of app
  // console.info("Cleaning up app", { app, viewport });
  app.stage.removeChildren(); // Just to be sure, remove the current stage children ( memory leak...)
  app?.stop();
  // On unload completely destroy the application and all of it's children
  // app?.destroy(true, { children: true });
}

export const pointerEvents = {
  pointerdown: "pointerdown",
  pointerup: "pointerup",
  pointerupoutside: "pointerupoutside",
  pointermove: "pointermove",
  mouseover: "mouseover",
  mouseout: "mouseout",
};

function addToolBox(
  draggable: (card: PIXI.Graphics, vsmObjectType: vsmObjectTypes) => void
) {
  // const
  const box = new PIXI.Container();

  const padding = 40;
  //  Render the drag'n-drop-box
  const rectangle = new Graphics();
  const width = padding * 4;
  const height = 54;
  rectangle.beginFill(0xffffff);
  rectangle.drawRoundedRect(0, 0, width, height, 8);
  rectangle.endFill();

  box.addChild(rectangle);

  // Render the icons
  const mainActivity = new Graphics();
  mainActivity.beginFill(0x52c0ff);
  mainActivity.drawRoundedRect(0, 0, 22, 22, 2);
  mainActivity.endFill();
  mainActivity.x = 14;
  mainActivity.y = rectangle.y + rectangle.height / 2 - mainActivity.height / 2;

  // clickHandler(mainActivity, () => toggleDrag(viewport));
  draggable(mainActivity, vsmObjectTypes.mainActivity);

  // For mouse-only events
  // .on('mousedown', onDragStart)
  box.addChild(mainActivity);

  const subActivity = new Graphics();
  subActivity.beginFill(0xfdd835);
  subActivity.drawRoundedRect(0, 0, 22, 22, 2);
  subActivity.endFill();
  subActivity.x = mainActivity.x + padding;
  subActivity.y = rectangle.y + rectangle.height / 2 - subActivity.height / 2;
  draggable(subActivity, vsmObjectTypes.subActivity);
  box.addChild(subActivity);

  const choiceIcon = new Graphics();
  choiceIcon.beginFill(0xfdd835);
  const hypotenuse = 22;
  const edge = Math.sqrt(hypotenuse ** 2 / 2);
  choiceIcon.drawRoundedRect(0, 0, edge, edge, 2);
  choiceIcon.pivot.x = choiceIcon.width / 2;
  choiceIcon.pivot.y = choiceIcon.height / 2;

  choiceIcon.y =
    rectangle.y +
    rectangle.height / 2 -
    choiceIcon.height / 2 +
    choiceIcon.height / 2;
  choiceIcon.x = subActivity.x + padding + choiceIcon.width / 2;
  choiceIcon.angle = 45;
  draggable(choiceIcon, vsmObjectTypes.choice);
  box.addChild(choiceIcon);

  const waitingIcon = new Graphics();
  waitingIcon.beginFill(0xff8f00);
  waitingIcon.drawRoundedRect(0, 0, 22, 12, 2);
  waitingIcon.endFill();
  waitingIcon.x = choiceIcon.x - choiceIcon.width + padding;
  waitingIcon.y = rectangle.y + rectangle.height / 2 - waitingIcon.height / 2;
  box.addChild(waitingIcon);
  draggable(waitingIcon, vsmObjectTypes.waiting);

  // box.y = viewport.height + 50;
  // box.x = 40;

  // viewport.addChild(box);
  app.stage.addChild(box);
  box.y = window.innerHeight - 70 - box.height - 8;
  box.x = window.innerWidth / 2 - box.width / 2;
  // mainActivity.visible = false;
  // choiceIcon.visible = false;
}

let hoveredObject: vsmObject | null = null;
export default function VSMCanvas(props: {
  style?: React.CSSProperties | undefined;
  refreshProject: () => void;
}): JSX.Element {
  const ref = useRef(document.createElement("div"));
  const [selectedObject, setSelectedObject] = useState(defaultObject);
  const dispatch = useStoreDispatch();
  const project = useStoreState((state) => state.project);

  function setHoveredObject(vsmObject: vsmObject) {
    hoveredObject = vsmObject;
  }

  const clearHoveredObject = () => {
    hoveredObject = null;
  };

  function addNewVsmObjectToHoveredCard(vsmObjectType: vsmObjectTypes) {
    if (hoveredObject) {
      const { pkObjectType } = hoveredObject.vsmObjectType;
      switch (vsmObjectType) {
        case vsmObjectTypes.process:
          break;
        case vsmObjectTypes.supplier:
          break;
        case vsmObjectTypes.input:
          break;
        case vsmObjectTypes.mainActivity:
          if (
            pkObjectType === vsmObjectTypes.mainActivity ||
            pkObjectType === vsmObjectTypes.input
          ) {
            dispatch.addObject(newMainActivitySiblingObject(hoveredObject));
          }
          break;
        case vsmObjectTypes.subActivity:
          if (
            pkObjectType === vsmObjectTypes.mainActivity ||
            pkObjectType === vsmObjectTypes.subActivity ||
            pkObjectType === vsmObjectTypes.waiting
          ) {
            dispatch.addObject(newSubActivityObject(hoveredObject));
          }
          break;
        case vsmObjectTypes.text:
          break;
        case vsmObjectTypes.waiting:
          if (
            pkObjectType === vsmObjectTypes.mainActivity ||
            pkObjectType === vsmObjectTypes.subActivity ||
            pkObjectType === vsmObjectTypes.waiting
          ) {
            dispatch.addObject(newWaitingObject(hoveredObject));
          }
          break;
        case vsmObjectTypes.output:
          break;
        case vsmObjectTypes.customer:
          break;
        case vsmObjectTypes.choice:
          if (
            pkObjectType === vsmObjectTypes.mainActivity ||
            pkObjectType === vsmObjectTypes.subActivity ||
            pkObjectType === vsmObjectTypes.waiting
          ) {
            dispatch.addObject(newChoiceObject(hoveredObject));
          }

          break;
      }
    }
  }

  function draggable(card: PIXI.Graphics, vsmObjectType: vsmObjectTypes) {
    const originalPosition = {
      x: card.position.x,
      y: card.position.y,
    };

    function onDragStart(event) {
      viewport.plugins.pause("drag");
      // store a reference to the data
      // the reason for this is because of multitouch
      // we want to track the movement of this particular touch
      this.data = event.data;
      this.alpha = 0.5;
      this.dragging = true;
    }

    function onDragEnd() {
      addNewVsmObjectToHoveredCard(vsmObjectType);

      this.alpha = 1;
      this.dragging = false;
      //Move the card back to where it started
      this.x = originalPosition.x;
      this.y = originalPosition.y;
      // set the interaction data to null
      this.data = null;
      viewport.plugins.resume("drag");
      clearHoveredObject();
    }

    function onDragMove() {
      if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x;
        this.y = newPosition.y;
      }
    }

    card.interactive = true;
    card
      .on(pointerEvents.mouseover, () => (card.alpha = 0.2))
      .on(pointerEvents.mouseout, () => (card.alpha = 1))
      .on(pointerEvents.pointerdown, onDragStart)
      .on(pointerEvents.pointerup, onDragEnd)
      .on(pointerEvents.pointerupoutside, onDragEnd)
      .on(pointerEvents.pointermove, onDragMove);
  }

  // "Constructor"
  useEffect(() => {
    initCanvas(ref);
    return () => cleanupApp();
  }, []);

  let dragEnabled: boolean;
  dragEnabled = true;

  function toggleDrag(viewport: Viewport) {
    if (dragEnabled) viewport.plugins.pause("drag");
    else viewport.plugins.resume("drag");
    dragEnabled = !dragEnabled;
  }

  // "Renderer"
  useEffect(() => {
    if (project) {
      const viewport = getViewPort();
      addCards(viewport);

      return () => {
        console.info("Clearing canvas");
        viewport.removeChildren();
      };
    }
  }, [project]);

  useEffect(() => {
    addToolBox(draggable);
  }, []);

  const newMainActivitySiblingObject = (bigBrother) => ({
    parent: project.objects[0],
    child: {
      vsmObjectID: uid(),
      vsmProjectID: project.vsmProjectID,
      bigBrother: bigBrother.vsmObjectID, //Let's figure out how this one works. Talk with Peder
      vsmObjectType: { pkObjectType: vsmObjectTypes.mainActivity },
      parent: project.objects[0].vsmObjectID,
      childObjects: [],
    } as vsmObject,
  });
  const newSubActivityObject = (parent) => ({
    parent: parent,
    child: {
      vsmObjectID: uid(),
      vsmProjectID: project.vsmProjectID,
      vsmObjectType: { pkObjectType: vsmObjectTypes.subActivity },
      parent: parent.vsmObjectID,
      childObjects: [],
    } as vsmObject,
  });
  const newWaitingObject = (parent) => ({
    parent: parent,
    child: {
      vsmObjectID: uid(),
      vsmProjectID: project.vsmProjectID,
      vsmObjectType: { pkObjectType: vsmObjectTypes.waiting },
      parent: parent.vsmObjectID,
      childObjects: [],
    } as vsmObject,
  });

  const newChoiceObject = (parent) => {
    const choiceUid = uid();
    return {
      parent: parent,
      child: {
        vsmObjectID: choiceUid,
        vsmProjectID: project.vsmProjectID,
        vsmObjectType: { pkObjectType: vsmObjectTypes.choice },
        childObjects: [
          {
            vsmObjectID: uid(),
            vsmProjectID: project.vsmProjectID,
            vsmObjectType: { pkObjectType: vsmObjectTypes.subActivity },
            parent: choiceUid,
            childObjects: [],
          },
          {
            vsmObjectID: uid(),
            vsmProjectID: project.vsmProjectID,
            vsmObjectType: { pkObjectType: vsmObjectTypes.subActivity },
            parent: choiceUid,
            childObjects: [],
          },
        ],
      } as vsmObject,
    };
  };

  function createTree(root: vsmObject): Container {
    const padding = 20;

    const container = new PIXI.Container();
    container.addChild(
      vsmObjectFactory(
        root,
        () => setSelectedObject(root),
        () => setHoveredObject(root),
        () => clearHoveredObject()
      )
    );
    // container.addChild(getObject(root));
    container.y = container.height + padding;

    let nextX = 0;
    root.childObjects?.forEach((child, index) => {
      // const node = createTree({ ...child, name: index.toString() });
      const node = createTree(child);
      //Todo: Figure out how to render choices
      // without any of them crashing
      // And it should look like figma sketch
      node.x = nextX;

      // Add this group width + padding as the next x location
      nextX = nextX + node.width + padding;
      container.addChild(node);
    });

    return container;
  }

  function addCards(viewport: Viewport) {
    console.info("Adding cards to canvas", { project });
    const tree = project;
    const root = tree.objects ? tree.objects[0] : null;
    if (!root) {
      viewport.addChild(
        GenericPostit({
          header: "ERROR",
          content: "Project contains no root object",
          options: {
            color: 0xff1243,
          },
        })
      );
    } else {
      viewport.addChild(createTree(root));
    }
  }

  function updateObjectName() {
    return (event: { target: { value: string } }) => {
      const name = event.target.value;
      setSelectedObject({ ...selectedObject, name });
      debounce(
        () => {
          dispatch.updateVSMObject({ ...selectedObject, name } as vsmObject);
        },
        1000,
        "Canvas-UpdateName"
      )();
    };
  }

  function updateObjectRole() {
    return (event) => {
      const role = event.target.value;
      setSelectedObject({ ...selectedObject, role });
      debounce(
        () => {
          dispatch.updateVSMObject({ ...selectedObject, role } as vsmObject);
        },
        1000,
        "Canvas-UpdateRole"
      )();
    };
  }

  function updateObjectTime() {
    return (event) => {
      const time = parseInt(event.target.value);
      setSelectedObject({ ...selectedObject, time });
      debounce(
        () => {
          dispatch.updateVSMObject({ ...selectedObject, time } as vsmObject);
        },
        1000,
        "Canvas-UpdateTime"
      )();
    };
  }

  return (
    <>
      <VSMSideBar
        onClose={() => setSelectedObject(defaultObject)}
        selectedObject={selectedObject}
        key={selectedObject.vsmObjectID}
        onChangeName={updateObjectName()}
        onChangeRole={updateObjectRole()}
        onChangeTime={updateObjectTime()}
      />
      <div className={style.canvasWrapper} ref={ref} />
    </>
  );
}
