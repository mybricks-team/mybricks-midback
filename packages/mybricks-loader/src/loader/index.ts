import { loadScript } from "./loadScript";
import { compareVersions } from "compare-versions";
const ComLib_Edit = "__comlibs_edit_";
const loader = async (lib: ComLibType) => {
  try {
    const { styles } = await loadScript(lib.editJs);
    //@ts-ignore
    const loadedLib = window[ComLib_Edit].find(
      (winLib: any) =>
        winLib.namespace === lib.namespace || winLib.id === lib.id
    );
    loadedLib.id = lib.id;
    loadedLib.namespace = lib.namespace;
    loadedLib._styleAry = styles;
    try {
      if (
        lib.latestComlib &&
        compareVersions(lib.latestComlib.version, loadedLib.version) > 0
      ) {
        loadedLib.latestComlib = lib.latestComlib;
      }
    } catch (error) {
      console.warn(
        `[loader]: ${lib.latestComlib?.namespace} 组件库是测试版本，无法进行在线升级`
      );
    }
    return loadedLib;
  } catch (error) {
    throw error;
  }
};

export { loader };
