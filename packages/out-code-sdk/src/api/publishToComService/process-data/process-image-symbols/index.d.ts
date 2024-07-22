import { ToJSON } from "../../types";
export interface ISymbolValue {
    symbol: string;
    value: string;
}
export declare function processImageSymbols(json: ToJSON, origin: string, staticResourceToCDN: boolean, uploadCDNUrl?: string): Promise<{
    symbols: {
        symbol: string;
        value: string;
    }[];
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
