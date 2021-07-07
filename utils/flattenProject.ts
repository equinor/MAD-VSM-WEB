import { vsmProject } from "../interfaces/VsmProject";
import { vsmObject } from "../interfaces/VsmObject";

export function flattenProject(project: vsmProject): Array<vsmObject> {
  if (!project) return [];
  const vsmObjects: Array<vsmObject> = [];

  function addAllObjectsToArray(o: vsmObject) {
    if (!o) return;
    vsmObjects.push(o);
    o.childObjects?.forEach((child) => {
      addAllObjectsToArray(child);
    });
  }

  project.objects.forEach((o) => {
    addAllObjectsToArray(o);
  });

  return vsmObjects;
}
