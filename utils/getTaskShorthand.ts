import { taskObject } from "interfaces/taskObject";

export const getTaskShorthand = (task: taskObject): string =>
  task?.type?.slice(0, 1) + (task.number + 1);