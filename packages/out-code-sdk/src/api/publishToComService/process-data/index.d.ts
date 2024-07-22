import { IParams } from "..";
export interface ISymbolValue {
    symbol: string;
    value: string;
}
export declare function processData(params: IParams): Promise<{
    symbols: ISymbolValue[];
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
