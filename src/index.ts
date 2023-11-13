import { watch, Ref, WatchStopHandle } from "vue"

export enum SettingType {
    Str = 'str',
    Json = 'json',
    Object = 'json',
    Number = 'number',
    Bool = 'bool',
}

interface SettingOption {
    deepMerge?: boolean
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
     * @param key -  key of the setting
     * @param refObj - ref object
     * @param type - type of the setting
     * @returns void
     * 
     * @throws Error if setting already registered
     */
    public register(
        key: string,
        refObj: Ref<any>,
        type: SettingType = SettingType.Str,
        option: SettingOption = {}
    ) {
        if (this.registered[key] !== undefined)
            throw new Error(`Setting ${key} already registered`)
        const value = this.get(key, type, null)
        if (value == null) {
            this.set(key, refObj.value)
        }
        else {
            if (option.deepMerge && type === SettingType.Json) {
                refObj.value = Settings.deepMergeObject(refObj.value, value)
            } else {
                refObj.value = value
            }
        }
        this.registered[key] =
            watch(refObj, (newVal: any) => {
                this.set(key, newVal)
            }, {
                deep: type === SettingType.Json
            })
    }

    /**
     * unregister a setting
     * 
     * @param key - key of the setting
     * @returns void
     * 
     * @throws Error if setting not registered
     */
    public unregister(key: string) {
        if (this.registered[key] === undefined)
            throw new Error(`Setting ${key} not registered`)
        this.registered[key]()
        delete this.registered[key]
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

    set(key: string, value: any) {
        let data = value
        if (typeof value === 'object')
            data = JSON.stringify(value)

        // @ts-ignore
        localStorage.setItem(`${this.settingPrefix}-${key}`, String(data))
    }

    get(key: string, type: SettingType, defaultValue: any): any {
        // @ts-ignore
        const value = localStorage.getItem(`${this.settingPrefix}-${key}`)
        if (value === null)
            return defaultValue

        if (type === SettingType.Json)
            return JSON.parse(value)

        if (type === SettingType.Number)
            return Number(value)

        if (type === SettingType.Bool)
            return value === 'true'

        return value
    }

    static deepMergeObject(obj1: any, obj2: any) {
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