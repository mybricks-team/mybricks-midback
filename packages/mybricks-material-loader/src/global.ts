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
  coms?: string
  editJs?: string
  rtJs?: string
};

interface ComlibOption {
  lib: ComLibType | undefined,
  libs?: Array<ComLibType>
  index?: number
}

interface ComOption {
  com: ComType[] | undefined,
  mySelfComlib: ComLibType
  index?: number
}
type OperateOption = ComOption | ComlibOption
interface ComLibType {
  id: string;
  namespace: string;
  title: string;
  version?: string
  comAray?: Array<ComType>;
  defined?: boolean;
  editJs: string;
  latestComlib?: LatestComlib & ComLibType;
}

export type ContentComlibs = Array<
  { id: number | string; namespace: string } & Record<string, unknown>
>;

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
  /** 添加组件库，自己定的key */
  ADD_COM_LIB = 'addComLib'
}

interface LibDesc extends ComLibType {
  cmd: CMD;
  libId: string;
  libNamespace: string;
  comNamespace?: string;
}

export { type ComType, LatestComlib, ComLibType, CMD, LibDesc, OperateOption, ComOption, ComlibOption };
