import { expect, it } from 'vitest'
import { Settings } from "./index";

it('deepMergeObject fn test', () => {
    const obj1 = {
        a: 1,
        b: {
            c: 2,
            d: 3
        }
    }
    const obj2 = {
        a: {},
        b: {
            c: 3,
            e: 4
        }
    }
    const result1 = {
        a: 1,
        b: {
            c: 3,
            d: 3,
        }
    }
    const result2 ={
        a: { },
        b: {
            c: 2,
            e: 4,
        }
    }
    expect(Settings.deepMergeObject(obj1, obj2)).toEqual(result1)
    expect(Settings.deepMergeObject(obj2, obj1)).toEqual(result2)
})
