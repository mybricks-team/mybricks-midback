import materialServerIns from "../materialService";
import { ContentComlibs } from "../global";

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

const checkDeps = async (libs: Array<string | Record<string, any>>) => {
  for (let i = 0; i < libs.length; i++) {
    const lib = libs[i];
    if (typeof lib === 'string' || "externals" in lib || lib.id === "_myself_") continue;
    try {
      const material = await materialServerIns.config?.getLibExternalsAPI({
        namespace: lib.namespace,
        version: lib.version,
      });
      Object.assign(lib, material);
    } catch (error) {
      console.error("获取物料依赖失败\n", error);
    }
  }
  return libs;
};

const insertDeps = async (libs: Array<string | Object>) => {
  if (!libs.length) return libs;
  await Promise.all(
    libs.map((lib) => {
      return (typeof lib === 'object' && "externals" in lib) ? insertExternal(lib) : Promise.resolve();
    })
  );
  return libs;
};

export const compatContent = (content: any) => {
  content = JSON.parse(content);
  return content['react'] ?? content;
};


export const upgradeExternalFn = (getLibExternalsAPI) =>
  composeAsync(insertExternal, getLibExternalsAPI);
 
 export const getLatestComLib = async (comlibs: ContentComlibs) => {
  const latestComlibs = await materialServerIns.config.getLatestComLibsAPI(
    comlibs.filter((lib) => lib.id !== "_myself_").map((lib: any) => lib.namespace)
  ).then((libs) =>
    (libs ?? []).map((lib: any) => ({
      ...lib,
      ...compatContent(lib.content),
    }))
  );
  return { comlibs, latestComlibs };
};
export const getComLibsLatestAndExternals = (getLatestComLibAPI) => composeAsync(getLatestComLibAPI, insertDeps, checkDeps)