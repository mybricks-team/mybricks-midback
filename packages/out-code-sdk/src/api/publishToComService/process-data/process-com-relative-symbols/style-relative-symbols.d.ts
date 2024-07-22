import { ToJSON } from "../../types";
export declare const processStyleRelativeSymbols: (fileId: number, transformJson: ToJSON) => Promise<{
    symbol: string;
    value: string;
}[]>;
