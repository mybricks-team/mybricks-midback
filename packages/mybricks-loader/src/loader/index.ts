import { loadScript } from "./loadScript";
import { compareVersions } from "compare-versions";

const findLibIndexFromGlobal = (lib: ComLibType) => {
  const prevIndex = window[ComLib_Edit].findIndex(
    (winLib: any) => winLib.namespace === lib.namespace || winLib.id === lib.id
  );
  return prevIndex;
};

const loader = async (lib: ComLibType) => {
  const prevIndex = findLibIndexFromGlobal(lib);
  if (prevIndex > 0) {
    window[ComLib_Edit].splice(prevIndex, 1);
  }
  try {
    const { styles } = await loadScript(lib.editJs);
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

const initGlobal = () => {
  if (!window[ComLib_Edit]) {
    window[ComLib_Edit] = [];
  }

  if (!window[ComLib_Rt]) {
    window[ComLib_Rt] = window[ComLib_Edit];
  }

  if (!window[CloudComponentDependentComponents]) {
    window[CloudComponentDependentComponents] = {};
  }
};

export { loader, initGlobal };
