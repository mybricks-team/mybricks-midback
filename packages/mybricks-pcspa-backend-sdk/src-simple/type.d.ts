import { ILocalizationInfo } from "nodejs/module/interface"

type TProcessor = (ctx: TContext) => Promise<void>

type TContext = {
    req: any,
    json: TJson,
    templatePath: string,
    userId: string,
    fileId: number,
    commitInfo: string,
    appConfig: any
    // 一下字段，为处理过程中生成的数据
    template?: string,
    envType?: string,
    configuration?: TConfiguration,
    version?: string,
    needCombo?: boolean,
    hasOldComLib?: boolean,
    comlibRtName?: string,
    app_type?: string,
    comboScriptText?: string
    globalDeps?: ILocalizationInfo[]
    images?: ILocalizationInfo[]
    result?: any
}

type TJson = {
    configuration: TConfiguration,
    [key]: any
}

type TConfiguration = {
    title: string,
    comlibs: any[],
    projectId: string,
    fileName: string,
    folderPath: string,
    publisherEmail: string,
    publisherName: string,
    groupId: number,
    groupName: string,
    envList: string[],
    i18nLangContent: any,
}
enum APPType {
    React = 'react',
    Vue2 = 'vue2',
    Vue3 = 'vue3'
}