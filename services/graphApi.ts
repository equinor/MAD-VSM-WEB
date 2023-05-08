const baseUrl = "/api/v2.0";

import BaseAPIServices from "./BaseAPIServices";
import { vsmObject } from "../interfaces/VsmObject";

export const getGraph = (projectId: string | string[]): Promise<vsmObject> => {
  return BaseAPIServices.get(`${baseUrl}/graph/${projectId}/vertices`).then(
    (value) => value.data
  );
};

export const addVertice = (
  data: { type: string },
  projectId: string,
  parentId: string
): Promise<unknown> =>
  BaseAPIServices.post(
    `${baseUrl}/graph/${projectId}/vertices/${parentId}`,
    data
  ).then((r) => r.data);

export const patchGraph = (
  data: vsmObject,
  projectId: string | string[],
  vertexId: string
): Promise<vsmObject> =>
  BaseAPIServices.put(
    `${baseUrl}/graph/${projectId}/vertices/${vertexId}`,
    data
  ).then((r) => r.data);

export const deleteVertice = (
  projectId: number,
  vertexId: number
): Promise<unknown> =>
  BaseAPIServices.delete(
    `${baseUrl}/graph/${projectId}/vertices/${vertexId}`
  ).then((r) => r.data);

export const moveVertice = (
  data: { vertexToMoveId: string; vertexDestinationParentId: string },
  projectId: string
): Promise<unknown> =>
  BaseAPIServices.post(
    `${baseUrl}/graph/${projectId}/vertices/move-vertex`,
    data
  ).then((r) => r.data);

export const addVerticeLeft = (
  data: { type: string },
  projectId: string,
  neighbourId: string
): Promise<unknown> =>
  BaseAPIServices.post(
    `${baseUrl}/graph/${projectId}/vertices/${neighbourId}/left`,
    data
  ).then((r) => r.data);

export const addVerticeRight = (
  data: { type: string },
  projectId: string,
  neighbourId: string
): Promise<unknown> =>
  BaseAPIServices.post(
    `${baseUrl}/graph/${projectId}/vertices/${neighbourId}/right`,
    data
  ).then((r) => r.data);

export const addVerticeMultipleParents = (
  data: { type: string; parents: Array<string> },
  projectId: string
): Promise<unknown> =>
  BaseAPIServices.post(
    `${baseUrl}/graph/${projectId}/vertices/multiple-parents`,
    data
  ).then((r) => r.data);

export const moveVerticeRightOfTarget = (
  data: { vertexId: string },
  targetId: string,
  projectId: string
): Promise<unknown> =>
  BaseAPIServices.put(
    `${baseUrl}/graph/${projectId}/vertices/${targetId}/right`,
    data
  ).then((r) => r.data);
