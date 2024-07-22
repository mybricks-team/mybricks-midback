import { ISymbolValue } from "..";
import { GetMaterialContent } from "../../types";
interface IProps {
    json: any;
    comLibs: any;
    fileId: number;
    getMaterialContent: GetMaterialContent;
}
export default function processComRelativeSymbols({ json, comLibs, fileId, getMaterialContent }: IProps): Promise<ISymbolValue[]>;
export {};
