type ComType = {
  id: string;
  author: string;
  title: string;
  version: string;
  runtime: Function;
  editors: Record<string, any>;
  data: Record<string, any>;
  icon: string;
  namespace: string;
};

type LatestComlib = {
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
  /** 添加UI组件 */
  ADD_UI_COM = 'addUICom',
  /** 添加JS组件 */
  ADD_JS_COM = 'addJSCom',
  DELETE_COM_LIB = "deleteComLib",
  UPGRADE_COM_LIB = "upgradeComLib",
}

interface LibDesc extends ComLibType {
  cmd: CMD;
  libId: string;
  libNamespace: string;
  comNamespace?: string;
}

export { type ComType, LatestComlib, ComLibType, CMD, LibDesc };
