import { ComLibType } from './global'
export type MaterialServerConfig = Partial<{
  onAddComLib: (lib: ComLibType, libs: Array<ComLibType>) => void;
  onDeleteComLib: (
    lib: ComLibType | undefined,
    libs: Array<ComLibType>
  ) => void;
  onUpgradeComLib: (lib: ComLibType, libs: Array<ComLibType>) => void;
}>;
class MaterialService {
  config: MaterialServerConfig = {};
  set(config: MaterialServerConfig) {
    this.config = { ...this.config, ...config };
  }
}

const materialService = new MaterialService();

export default materialService;
