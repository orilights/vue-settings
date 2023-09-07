import { watch, Ref } from "vue"

export enum SettingType {
    Str = 'str',
    Json = 'json',
    Number = 'number',
    Bool = 'bool',
}

export class Settings {
    abbr: string
    constructor(appAbbr: string) {
        this.abbr = appAbbr
    }

    /**
     * register
     */
    public register(settingKey: string, refObj: Ref<any>, settingType: SettingType = SettingType.Str) {
        const value = this.get(settingKey, settingType, null)
        if (value == null) {
            this.set(settingKey, refObj.value)
        }
        else {
            refObj.value = value
        }
        watch(refObj, (newVal:any) => {
            this.set(settingKey, newVal)
        })
    }

    set(settingKey: string, value: any) {
        let data = value
        if (typeof value === 'object')
            data = JSON.stringify(value)
        // @ts-ignore
        localStorage.setItem(`${this.abbr}-setting-${settingKey}`, String(data))
    }

    get(settingKey: string, settingType: SettingType, defaultValue: any): any {
        // @ts-ignore
        const value = localStorage.getItem(`${this.abbr}-setting-${settingKey}`)
        if (value === null)
            return defaultValue

        if (settingType === SettingType.Json)
            return JSON.parse(value)

        if (settingType === SettingType.Number)
            return Number(value)

        if (settingType === SettingType.Bool)
            return value === 'true'

        return value
    }

}