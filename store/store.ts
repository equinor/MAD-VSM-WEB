import { Action, action, createStore } from "easy-peasy";

export type ProjectModel = {
  ///// STORE VARIABLES ///////////////
  snackMessage: string | null;
  pqirToBeDeletedId: string | null;

  //// ACTIONS ///////////////////
  setSnackMessage: Action<ProjectModel, string>;
  setPQIRToBeDeletedId: Action<ProjectModel, string | null>;
};

const projectModel: ProjectModel = {
  //State
  snackMessage: null,
  pqirToBeDeletedId: null,

  //Actions
  setSnackMessage: action((state, payload) => {
    state.snackMessage = payload;
  }),
  setPQIRToBeDeletedId: action((state, payload) => {
    state.pqirToBeDeletedId = payload;
  }),
};

const store = createStore(projectModel, {
  name: "project",
});

export default store;
