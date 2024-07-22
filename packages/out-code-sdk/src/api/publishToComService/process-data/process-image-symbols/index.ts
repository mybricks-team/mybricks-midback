import * as fs from "fs";
import * as path from "path";
import { ToJSON } from "../../types";
import resourceProcessing from "./resource-processing";

export interface ISymbolValue {
  symbol: string;
  value: string;
}

type StaticResources = {
  url: string;
  filename: string;
  cdnUrl: string;
}[] | {
  url: string;
  filename: string;
  content: string;
}[];

function genImage(staticResources: StaticResources) {
  let imageImportStr = "";
  let imageUrlMap = "";

  staticResources.forEach((item, index) => {
    const { filename } = item;
    // 有 cdnUrl 字段，说明资源已经上传到 CDN 上了，无需本地化
    if ('cdnUrl' in item) {
      imageUrlMap += `"${filename}": "${item.cdnUrl}",`;
    } else {
      imageImportStr += `import image${index} from './assets/${filename}';`
      imageUrlMap += `"${filename}": image${index},`;
    }
  })

  return { imageImportStr, imageUrlMap: `{${imageUrlMap}}` };
}

export async function processImageSymbols(json: ToJSON, staticResourceToCDN: boolean): Promise<ISymbolValue[]> {
  const staticResources = await resourceProcessing(json, { toCDN: staticResourceToCDN, origin })

  const { imageImportStr, imageUrlMap } = genImage(staticResources);

  const haveImage = staticResources.length > 0;

  return [
    { symbol: 'imageImports', value: haveImage ? fs.readFileSync(path.resolve(__dirname, "./templates/config-extends-image-tpl.txt"), "utf8") : '' },
    { symbol: 'toJSONPretreatment', value: haveImage ? `replaceDynamicImportImg(toJSON)` : '' },
    { symbol: 'imageImportStr', value: imageImportStr },
    { symbol: 'imageUrlMap', value: imageUrlMap },
  ]
}