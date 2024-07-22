import type { LoggerType } from './utils/global-logger';
import { GetMaterialContent, ToJSON } from './types';
export interface IParams {
    json: ToJSON & {
        configuration: any;
    };
    fileId: number;
    componentName: string;
    envType: string;
    hostname: string;
    toLocalType: string;
    origin: string;
    staticResourceToCDN: boolean;
    uploadCDNUrl?: string;
    getMaterialContent: GetMaterialContent;
}
export default function replaceTemplate(params: IParams, templateArray: string[], options?: {
    Logger?: LoggerType;
}): Promise<{
    codes: string[];
    staticResources: {
        url: string;
        filename: string;
        cdnUrl: string;
    }[] | {
        url: string;
        filename: string;
        content: string;
    }[];
}>;
