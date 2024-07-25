import materialServerIns from "../materialService";
import { ComLibType, CMD } from "../global";
import { SourceEnum } from "../constant";
import { loader } from "../loader";
import { loadScript } from "../loader/loadScript";

const upgradeComLib = (lib: ComLibType, libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    if (lib.hasOwnProperty("legacy")) {
      Reflect.deleteProperty(lib, "legacy");
    }
    try {
      const winIndex = window[SourceEnum.ComLib_Edit].findIndex(
        (wLib) => wLib.namespace === lib.namespace
      );
      window[SourceEnum.ComLib_Edit].splice(winIndex, 1);
      let updMaterials;
      if (materialServerIns.config.getLibExternals) {
        updMaterials = await upgradeExternalFn(
          materialServerIns.config.getLibExternals
        )({ namespace: lib.namespace, version: lib?.version });
      }
      const { styles } = await loadScript(lib.editJs);
      const prevIndex = libs.findIndex(
        ({ namespace }) => namespace === lib.namespace
      );
      if (prevIndex < 0) reject("comLib not found");
      const loadedLib = window[SourceEnum.ComLib_Edit].find(
        (wLib) => wLib.namespace === lib.namespace
      );
      loadedLib._styleAry = styles;

      const nextLibs = libs.slice();
      const fLib = { ...lib, ...updMaterials };
      nextLibs.splice(prevIndex, 1, fLib);
      resolve(loadedLib);

      materialServerIns.config.onUpgradeComLib!(fLib, nextLibs);
      materialServerIns.config.operateCallback(CMD.UPGRADE_COM_LIB, {
        lib: fLib,
        libs: nextLibs,
        index: prevIndex,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const upgradeLatestComLib = (lib: ComLibType, libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    const libIndex = libs.findIndex(
      ({ namespace }) => lib.namespace === namespace
    );
    if (libIndex < 0) return reject("comLib not found");
    const { latestComlib, ...rest } = libs[libIndex];

    if (!latestComlib) return reject("comLib not found");
    const winIndex = window[SourceEnum.ComLib_Edit].findIndex(
      (wLib) => wLib.namespace === lib.namespace
    );
    window[SourceEnum.ComLib_Edit].splice(winIndex, 1);
    // PC页面，这里只执行原来的load(latestComlib) 会出现，提示添加,而不是升级提醒
    let updMaterials: any = {};
    if (materialServerIns.config.getLibExternals) {
      updMaterials = await upgradeExternalFn(
        materialServerIns.config.getLibExternals
      )({ namespace: latestComlib.namespace, version: latestComlib.version });
    }
    const { styles } = await loadScript(
      updMaterials?.editJs ?? latestComlib.editJs
    );

    const loadedLib = window[SourceEnum.ComLib_Edit].find(
      (wLib) => wLib.namespace === lib.namespace
    );
    loadedLib._styleAry = styles;
    const nextLibs = libs.slice();
    const fLib = {
      id: loadedLib.id,
      editJs: latestComlib.editJs,
      rtJs: latestComlib.rtJs,
      coms: latestComlib.coms,
      ...updMaterials,
    };
    nextLibs.splice(libIndex, 1, fLib);
    materialServerIns.config.onUpgradeComLib!(fLib, nextLibs);
    materialServerIns.config.operateCallback(CMD.UPGRADE_COM_LIB, {
      lib: fLib,
      libs: nextLibs,
      index: libIndex,
    });
    resolve(loadedLib);
  });
};

const createScript = (url: string) => {
  if (document.querySelector(`script[src="${url}"]`)) return Promise.resolve();
  const script = document.createElement("script");
  script.src = url;
  script.defer = true;
  return new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const createLink = (url: string) => {
  if (document.querySelector(`link[href="${url}"]`)) return Promise.resolve();
  const link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

const composeAsync =
  (...fns) =>
  async (arg) =>
    fns.reduceRight(async (pre, fn) => fn(await pre), Promise.resolve(arg));

const insertExternal = async (lib) => {
  const p = [];
  lib.externals?.forEach((it) => {
    const { library, urls } = it;
    if (Array.isArray(urls) && urls.length) {
      urls.forEach((url) => {
        if (url.endsWith(".js")) {
          if (library in window) return;
          p.push(createScript(url));
        }
        if (url.endsWith(".css")) {
          p.push(createLink(url));
        }
      });
    }
  });
  await Promise.all(p);
  return lib;
};
const upgradeExternalFn = (getLibExternals) =>
  composeAsync(insertExternal, getLibExternals);

export { upgradeComLib, upgradeLatestComLib, upgradeExternalFn };
