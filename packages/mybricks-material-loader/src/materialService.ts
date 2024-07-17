import { ComLibType, ComType } from "./global";
export type MaterialServerConfig = Partial<{
  onAddComLib: () => Promise<ComLibType>;
  onDeleteComLib: (
    lib: ComLibType | undefined,
    libs: Array<ComLibType>
  ) => void;
  onUpgradeComLib: (lib: ComLibType, libs: Array<ComLibType>) => void;
  onAddCom: () => Promise<ComType>;
  onAddJSCom: () => Promise<ComType[]>;
  onAddUICom: () => Promise<ComType[]>
  onUpgradeCom: (com: ComType) => Promise<ComType>;
  onDeleteCom: (com: ComType) => Promise<boolean>;
  hasMaterialApp?: boolean
}>;
class MaterialService {
  config: MaterialServerConfig = {};
  set(config: MaterialServerConfig) {
    this.config = { ...this.config, ...config };
  }
}

const materialService = new MaterialService();

export default materialService;
