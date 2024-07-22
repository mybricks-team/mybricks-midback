/** 从 toJSON 中处理出所有的资源地址 */
export declare function analysisAllResourceUrls(json: any, origin: string): string[];
/** 将 toJSON 中的所有资源下载下来并处理 */
export default function resourceProcessing(json: any, options: {
    toCDN: boolean;
    origin: string;
    uploadUrl?: string;
}): Promise<{
    url: string;
    filename: string;
    cdnUrl: string;
}[] | {
    url: string;
    filename: string;
    content: string;
}[]>;
