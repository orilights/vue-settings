import { watch, Ref, WatchStopHandle } from "vue"

export enum SettingType {
    Str = 'str',
    Json = 'json',
    Number = 'number',
    Bool = 'bool',
}

interface SettingOption {
    deep?: boolean
}

export class Settings {
    private abbr: string | undefined
    private registered: {
        [key: string]: WatchStopHandle
    } = {}
    private settingPrefix = 'setting'
    constructor(abbr: string | undefined = undefined) {
        this.abbr = abbr
        if (this.abbr !== undefined)
            this.settingPrefix = `${this.abbr}-setting`
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
    public register(settingKey: string,
        refObj: Ref<any>,
        settingType: SettingType = SettingType.Str,
        option: SettingOption = {}
    ) {
        if (this.registered[settingKey] !== undefined)
            throw new Error(`Setting ${settingKey} already registered`)
        const value = this.get(settingKey, settingType, null)
        if (value == null) {
            this.set(settingKey, refObj.value)
        }
        else {
            if (option.deep && settingType === SettingType.Json) {
                refObj.value = this.deepMergeObject(refObj.value, value)
            } else {
                refObj.value = value
            }
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
     */
    public unregister(settingKey: string) {
        if (this.registered[settingKey] === undefined)
            throw new Error(`Setting ${settingKey} not registered`)
        this.registered[settingKey]()
        delete this.registered[settingKey]
    }


    /**
     * unregister all settings
     * 
     * @returns void
     */
    public unregisterAll() {
        Object.keys(this.registered).map((key) => {
            this.unregister(key)
        })
    }

    /**
     * clear all settings in localStorage
     * 
     * @returns void
     */
    public clear() {
        this.unregisterAll()
        // @ts-ignore
        Object.keys(localStorage).map((key) => {
            if (key.startsWith(this.settingPrefix))
                // @ts-ignore
                localStorage.removeItem(key)
        })
    }

    set(settingKey: string, value: any) {
        let data = value
        if (typeof value === 'object')
            data = JSON.stringify(value)

        // @ts-ignore
        localStorage.setItem(`${this.settingPrefix}-${settingKey}`, String(data))
    }

    get(settingKey: string, settingType: SettingType, defaultValue: any): any {
        // @ts-ignore
        const value = localStorage.getItem(`${this.settingPrefix}-${settingKey}`)
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

    deepMergeObject(obj1: any, obj2: any) {
        const result = Object.assign({}, obj1);
        for (const key of Object.keys(obj2)) {
            if (obj1.hasOwnProperty(key)) {
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                    result[key] = this.deepMergeObject(obj1[key], obj2[key]);
                } else if (typeof obj1[key] !== 'object' && typeof obj2[key] !== 'object') {
                    result[key] = obj2[key]
                }
            }
        }
        return result;
    }
}