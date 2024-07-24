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
  getLibExternals: ({ namespace, version }) => Promise<any>
  hasMaterialApp?: boolean
  operateCallback?: (cmd: CMD, options: OperateOption) => void
}>;
class MaterialService {
  config: MaterialServerConfig = {};
  comlibs: ComLibType[] = []
  set(config: MaterialServerConfig, comlibs?: ComLibType[]) {
    this.config = { ...this.config, ...config };
    this.comlibs = comlibs || []
  }
}

const materialService = new MaterialService();

export default materialService;
