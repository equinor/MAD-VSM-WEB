const baseUrl = "/api/v2.0";

import BaseAPIServices from "./BaseAPIServices";
import { vsmObject } from "../interfaces/VsmObject";

export const getGraph = (projectId: number): Promise<vsmObject> => {
  return BaseAPIServices.get(`${baseUrl}/graph/${projectId}/vertices`).then(
    (value) => value.data
  );
};

export const postGraph = (
  data: vsmObject,
  projectId: number,
  parentId: number
): Promise<unknown> =>
  BaseAPIServices.post(
    `${baseUrl}/graph/${projectId}/vertices/${parentId}`,
    data
  ).then((r) => r.data);

export const patchGraph = (
  data: vsmObject,
  projectId: number,
  vertexId: number
): Promise<vsmObject> =>
  BaseAPIServices.patch(
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
