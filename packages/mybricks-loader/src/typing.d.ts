type ComType = {
  id: string;
  author: string;
  title: string;
  version: string;
  runtime: Function;
  editors: Record<string, any>;
  data: Record<string, any>;
  icon: string;
};

type LatestComlib = {
  content: string;
  namespace: string;
  version: string;
};

interface ComLibType {
  id: string;
  namespace: string;
  title: string;
  comAray?: Array<ComType>;
  defined?: boolean;
  editJs: string;
  latestComlib?: LatestComlib & ComLibType;
}

enum CMD {
  UPGRADE_COM = "upgradeCom",
  DELETE_COM = "deleteCom",
  ADD_COM = "addCom",
  DELETE_COM_LIB = "deleteComLib",
  UPGRADE_COM_LIB = "upgradeComLib",
}

interface LibDesc extends ComLibType {
  cmd: CMD;
  libId: string;
  libNamespace: string;
}
