type MaterialServerConfig = {
  afterDeleteComLib?: (lib: ComLibType | undefined) => void;
};
class MaterialService {
  config: MaterialServerConfig = {};
  set(config: MaterialServerConfig) {
    this.config = { ...this.config, ...config };
  }
}

const materialService = new MaterialService();

export default materialService;
