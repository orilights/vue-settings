import { watch, Ref, WatchStopHandle } from "vue"

export enum SettingType {
    Str = 'str',
    Json = 'json',
    Number = 'number',
    Bool = 'bool',
}

export class Settings {
    abbr: string
    registered: {
        [key: string]: WatchStopHandle
    } = {}
    constructor(appAbbr: string) {
        this.abbr = appAbbr
    }

    /**
     * register a ref object as setting
     * 
     * @param settingKey -  key of the setting
     * @param refObj - ref object
     * @param settingType - type of the setting
     * @returns void
     * 
     * @throws Error if setting already registered
     */
    public register(settingKey: string, refObj: Ref<any>, settingType: SettingType = SettingType.Str) {
        if (this.registered[settingKey] !== undefined)
            throw new Error(`Setting ${settingKey} already registered`)
        const value = this.get(settingKey, settingType, null)
        if (value == null) {
            this.set(settingKey, refObj.value)
        }
        else {
            refObj.value = value
        }
        this.registered[settingKey] =
            watch(refObj, (newVal: any) => {
                this.set(settingKey, newVal)
            }, {
                deep: settingType === SettingType.Json
            })
    }

    /**
     * unregister a setting
     * 
     * @param settingKey - key of the setting
     * @returns void
     * 
     * @throws Error if setting not registered
     * 
     */
    public unregister(settingKey: string) {
        if (this.registered[settingKey] === undefined)
            throw new Error(`Setting ${settingKey} not registered`)
        this.registered[settingKey]()
        delete this.registered[settingKey]
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