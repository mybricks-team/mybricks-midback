import { loadScript } from "./loadScript";
import { compareVersions } from "compare-versions";
import { SourceEnum } from '../constant'
import { ComLibType } from '../global'

const findLibIndexFromGlobal = (lib: ComLibType) => {
  const prevIndex = window[SourceEnum.ComLib_Edit].findIndex(
    (winLib: any) => winLib.namespace === lib.namespace || winLib.id === lib.id
  );
  return prevIndex;
};

const loader = async (lib: ComLibType) => {
  const prevIndex = findLibIndexFromGlobal(lib);
  if (prevIndex >= 0) {
    window[SourceEnum.ComLib_Edit].splice(prevIndex, 1);
  }
  try {
    const { styles } = await loadScript(lib.editJs);
    const loadedLib = window[SourceEnum.ComLib_Edit].find(
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
