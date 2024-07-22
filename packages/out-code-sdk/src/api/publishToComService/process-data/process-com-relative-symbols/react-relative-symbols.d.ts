import { GetMaterialContent, ToJSON } from "../../types";
export default function processReactRelativeSymbols(json: ToJSON, comLibs: any, getMaterialContent: GetMaterialContent): Promise<{
    symbol: string;
    value: string;
}[]>;
