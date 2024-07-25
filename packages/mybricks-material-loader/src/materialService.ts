import { ComLibType, ComType, CMD, OperateOption } from "./global";
export type MaterialServerConfig = Partial<{
  onAddComLib: () => Promise<ComLibType>;
  onDeleteComLib: (
    lib: ComLibType | undefined,
    libs: Array<ComLibType>
  ) => void;
  onUpgradeComLib: (lib: ComLibType, libs: Array<ComLibType>) => void;
  onAddCom: () => Promise<ComType[]>;
  onAddJSCom: () => Promise<ComType[]>;
  onAddUICom: () => Promise<ComType[]>
  onUpgradeCom: (com: ComType) => Promise<ComType>;
  onDeleteCom: (com: ComType) => Promise<boolean>;
  /**
   * 获取组件库的依赖，有需要的话，传递获取库依赖的方法后，loader内部会执行升级依赖操作
   */
  getLibExternals?: ({ namespace, version }) => Promise<any>
  hasMaterialApp?: boolean
  /** 操作回调函数 */
  operateCallback?: (cmd: CMD, options: OperateOption) => void
}>;
class MaterialService {
  config: MaterialServerConfig = {};
  set(config: MaterialServerConfig) {
    this.config = { ...this.config, ...config };
  }
}

const materialService = new MaterialService();

export default materialService;
