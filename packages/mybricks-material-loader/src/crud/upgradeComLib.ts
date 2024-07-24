import { loader } from "../loader";
import materialServerIns from "../materialService";
import { ComLibType, CMD } from "../global";
import { SourceEnum } from "../constant";
import { loadScript } from "../loader/loadScript";

const upgradeComLib = (lib: ComLibType, libs: Array<ComLibType>) => {
  return new Promise(async (resolve, reject) => {
    if (lib.hasOwnProperty("legacy")) {
      Reflect.deleteProperty(lib, "legacy");
    }
    debugger
    try {
      const loadedLib = await loader(lib);
      resolve(loadedLib);
      const prevIndex = libs.findIndex(
        ({ namespace }) => namespace === lib.namespace
      );
      if (prevIndex < 0) reject("comLib not found");
      const nextLibs = libs.slice();
      nextLibs.splice(prevIndex, 1, lib);
      materialServerIns.config.onUpgradeComLib!(lib, nextLibs);
      materialServerIns.config.operateCallback(CMD.UPGRADE_COM_LIB, {lib, libs: nextLibs, index: prevIndex})
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
    const winIndex = window[SourceEnum.ComLib_Edit].findIndex(wLib => wLib.namespace=== lib.namespace)
    window[SourceEnum.ComLib_Edit].splice(winIndex, 1)
    // 这里只执行下面这个load(latestComlib) 会出现，提示添加，
    const materials = await upgradeExternalFn(materialServerIns.config.getLibExternals)({ namespace: latestComlib.namespace, version: latestComlib.version})
    const { styles } = await loadScript(materials.editJs)
    // const loadedLib = await loader(latestComlib);
    const nextLib = { ...rest, ...latestComlib };
    const nextLibs = libs.slice();
    nextLibs.splice(libIndex, 1, nextLib);
    const loadedComlib2 = window[SourceEnum.ComLib_Edit].find(wLib => wLib.namespace=== lib.namespace);
    materialServerIns.comlibs.splice(libIndex, 1, loadedComlib2);
    console.log('materialServerIns', materialServerIns.comlibs)
    loadedComlib2.id = lib.id;
    debugger
    loadedComlib2._styleAry = styles;
    materialServerIns.config.onUpgradeComLib!(nextLib, nextLibs);
    materialServerIns.config.operateCallback(CMD.UPGRADE_COM_LIB, {lib: loadedComlib2, libs: nextLibs, index: libIndex})
    // resolve(loadedLib)
    resolve(loadedComlib2);
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
const upgradeExternalFn = (getLibExternals) =>  composeAsync(insertExternal, getLibExternals);

export { upgradeComLib, upgradeLatestComLib, upgradeExternalFn };
