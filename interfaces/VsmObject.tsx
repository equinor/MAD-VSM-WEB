import { vsmObjectTypes } from "../types/vsmObjectTypes";
import { vsmTaskTypes } from "../types/vsmTaskTypes";

export interface vsmObject {
  vsmObjectID?: number;
  vsmProjectID?: number;
  bigBrother?: number; //Todo: figure out with Peder how this will work. I think it should be leftObjectId
  position?: number;
  parent?: number;
  name?: string;
  fkObjectType?: vsmObjectTypes;
  time?: number;
  timeDefinition?: string;
  role?: string;
  childObjects?: Array<vsmObject>;
  vsmObjectType?: {
    pkObjectType: vsmObjectTypes;
    name?: string;
    description?: null;
    hidden?: boolean;
  };
  tasks?: [];
  created?: {
    pkChangeLog: number;
    userIdentity: string;
    changeDate: string;
    fkVsm: number;
    fkObject: vsmObjectTypes;
    fkTask: vsmTaskTypes;
  };
  lastUpdated?: {
    pkChangeLog: number;
    userIdentity: string;
    changeDate: string;
    fkVsm: number;
    fkObject: vsmObjectTypes;
    fkTask: vsmTaskTypes;
  };
}
