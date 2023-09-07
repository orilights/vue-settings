import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.cjs',
                format: 'cjs'
            }, {
                file: 'dist/index.mjs',
                format: 'esm'
            }
        ],
        plugins: [
            resolve(),
            json(),
            commonjs(),
            esbuild({
                target: 'es2015'
            })
        ],
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'index.d.ts',
        },
        plugins: [dts()]
    }
]