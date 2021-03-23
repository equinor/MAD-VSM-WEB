import React, { useEffect, useRef } from "react";
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
import style from "./VSMCanvas.module.scss";

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
  // add the viewport to the stage
  app.stage.addChild(viewport);

  if (isMobile) {
    viewport
      .drag()
      .pinch() // This doesn't work that well on desktop.
      .wheel()
      .decelerate({ friction: 0.4 });
  } else viewport.drag().wheel().decelerate({ friction: 0.4 });

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
  pointerover: "pointerover",
  pointerout: "pointerout",
  click: "click", // Fired when a pointer device button (usually a mouse left-button) is pressed and released on the display object. DisplayObject's interactive property must be set to true to fire event.
};

function addToolBox(
  draggable: (card: PIXI.Graphics, vsmObjectType: vsmObjectTypes) => void
) {
  const box = new PIXI.Container();

  const padding = 40;
  //  Render the drag'n-drop-box
  const rectangle = new Graphics();
  const width = padding * 4;
  const height = 54;
  rectangle.beginFill(0xffffff);
  rectangle.drawRoundedRect(0, 0, width, height, 6);
  rectangle.endFill();

  const rectangleBorder = new Graphics();
  rectangleBorder.beginFill(0xd6d6d6);
  rectangleBorder.drawRoundedRect(0, 0, width + 1, height + 1, 6);
  rectangleBorder.endFill();
  rectangle.x = 0.5;
  rectangle.y = 0.5;
  box.addChild(rectangleBorder);

  box.addChild(rectangle);

  // Render the icons
  const mainActivity = new Graphics();
  mainActivity.beginFill(0x52c0ff);
  mainActivity.drawRoundedRect(0, 0, 22, 22, 2);
  mainActivity.endFill();
  mainActivity.x = 14;
  mainActivity.y = rectangle.y + rectangle.height / 2 - mainActivity.height / 2;
  draggable(mainActivity, vsmObjectTypes.mainActivity);
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
  draggable(waitingIcon, vsmObjectTypes.waiting);
  box.addChild(waitingIcon);

  app.stage.addChild(box);
  box.y = window.innerHeight - 84 - box.height;
  box.x = window.innerWidth / 2 - box.width / 2;

  return () => app.stage.removeChild(box); //Cleanup method
}

let hoveredObject: vsmObject | null = null;
export default function VSMCanvas(): JSX.Element {
  const ref = useRef(document.createElement("div"));
  const selectedObject = useStoreState((state) => state.selectedObject);
  const dispatch = useStoreDispatch();
  const project = useStoreState((state) => state.project);

  function setHoveredObject(vsmObject: vsmObject) {
    hoveredObject = vsmObject;
  }

  const clearHoveredObject = () => {
    hoveredObject = null;
  };

  function addNewVsmObjectToHoveredCard(vsmObjectType: vsmObjectTypes) {
    //Todo: Improve target logic. Instead of using "hoveredObject", do a collision detection etc
    //  Read up on hitTest -> https://pixijs.download/release/docs/PIXI.InteractionManager.html#hitTest
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
        if (vsmObjectType === vsmObjectTypes.choice) {
          this.x = newPosition.x + 18; // move it slighly away from the pointer, since hoverevent is not triggered if object is between cursor and target
          this.y = newPosition.y + 18;
        } else {
          this.x = newPosition.x + 6;
          this.y = newPosition.y + 6;
        }
      }
    }

    card.interactive = true;
    card
      .on(pointerEvents.pointerover, () => {
        card.cursor = "pointer";
        card.alpha = 0.2;
      })
      .on(pointerEvents.pointerout, () => (card.alpha = 1))
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

  useEffect(() => addToolBox(draggable), [project]);

  function newMainActivitySiblingObject(leftObject) {
    return {
      parent: project.objects[0],
      leftObjectId: leftObject.vsmObjectID,
      child: {
        // vsmObjectID: uid(), //Todo: change to temporary (local) objectId so that we can update the view before recieving the actual id from api
        vsmProjectID: project.vsmProjectID,
        vsmObjectType: { pkObjectType: vsmObjectTypes.mainActivity },
        parent: project.objects[0].vsmObjectID,
        childObjects: [],
      } as vsmObject,
    };
  }

  const newSubActivityObject = (parent) => ({
    parent: parent,
    child: {
      // vsmObjectID: uid(), //Todo: change to temporary (local) objectId so that we can update the view before recieving the actual id from api
      vsmProjectID: project.vsmProjectID,
      vsmObjectType: { pkObjectType: vsmObjectTypes.subActivity },
      parent: parent.vsmObjectID,
      childObjects: [],
    } as vsmObject,
  });
  const newWaitingObject = (parent) => ({
    parent: parent,
    child: {
      // vsmObjectID: uid(), //Todo: change to temporary (local) objectId so that we can update the view before recieving the actual id from api
      vsmProjectID: project.vsmProjectID,
      vsmObjectType: { pkObjectType: vsmObjectTypes.waiting },
      parent: parent.vsmObjectID,
      childObjects: [],
    } as vsmObject,
  });

  const newChoiceObject = (parent) => ({
    parent: parent,
    child: {
      parent: parent.vsmObjectID,
      vsmProjectID: project.vsmProjectID,
      fkObjectType: vsmObjectTypes.choice,
      childObjects: [
        {
          vsmProjectID: project.vsmProjectID,
          fkObjectType: vsmObjectTypes.subActivity,
          childObjects: [],
        },
        {
          vsmProjectID: project.vsmProjectID,
          fkObjectType: vsmObjectTypes.subActivity,
          childObjects: [],
        },
      ],
      vsmObjectID: 0,
    } as vsmObject,
  });

  function recursiveTree(root: vsmObject): Container {
    const padding = 20;

    const container = new PIXI.Container();
    container.addChild(
      vsmObjectFactory(
        root,
        () => dispatch.setSelectedObject(root),
        () => {
          console.info({ hoveredObject: root });
          setHoveredObject(root);
        },
        () => clearHoveredObject()
      )
    );
    container.y = container.height + padding;

    let nextX = 0;
    root.childObjects?.forEach((child) => {
      const node = recursiveTree(child);
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
      viewport.addChild(recursiveTree(root));
    }
  }

  function onChangeNameHandler() {
    return (event: { target: { value: string } }) => {
      const name = event.target.value;
      dispatch.setSelectedObject({ ...selectedObject, name });
      debounce(
        () => {
          dispatch.updateVSMObject({ ...selectedObject, name } as vsmObject);
        },
        1000,
        "Canvas-UpdateName"
      )();
    };
  }

  function onChangeRoleHandler() {
    return (event) => {
      const role = event.target.value;
      dispatch.setSelectedObject({ ...selectedObject, role });
      debounce(
        () => {
          dispatch.updateVSMObject({ ...selectedObject, role } as vsmObject);
        },
        1000,
        "Canvas-UpdateRole"
      )();
    };
  }

  function onChangeTimeHandler() {
    return (event) => {
      let time = parseInt(event.target.value);
      if (time < 0) time = 0;
      dispatch.setSelectedObject({ ...selectedObject, time });
      debounce(
        () => {
          dispatch.updateVSMObject({ ...selectedObject, time } as vsmObject);
        },
        1000,
        "Canvas-UpdateTime"
      )();
    };
  }

  function onChangeTimeDefinitionHandler() {
    return (timeDefinition: string) => {
      dispatch.setSelectedObject({ ...selectedObject, timeDefinition });
      debounce(
        () => {
          dispatch.updateVSMObject({
            ...selectedObject,
            timeDefinition,
          } as vsmObject);
        },
        1000,
        "Canvas-UpdateTimeDefinition"
      )();
    };
  }

  return (
    <>
      <VSMSideBar
        onClose={() => dispatch.setSelectedObject(null)}
        onChangeName={onChangeNameHandler()}
        onChangeRole={onChangeRoleHandler()}
        onChangeTime={onChangeTimeHandler()}
        onChangeTimeDefinition={onChangeTimeDefinitionHandler()}
        onDelete={() => dispatch.deleteVSMObject(selectedObject)}
        onAddTask={(task) => dispatch.addTask(task)}
      />
      <div className={style.canvasWrapper} ref={ref} />
    </>
  );
}
