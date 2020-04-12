import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import requireContext from 'rollup-plugin-require-context'
import { join } from 'path'
import deepmerge from 'deepmerge'

const baseConfig = {
    input: join(__dirname, 'source', 'index.js'),
    output: {
        name: 'StringBean'
    },
    name: 'StringBean',
    plugins: [
        resolve({ jsnext: true }),
        commonjs({
            include: 'node_modules/**'
        })
    ]
}

const branchConfigs = [
    {
        output: {
            format: 'iife',
            file: join(__dirname, 'dist', 'StringBean-browser.js')
        }
    },
    {
        output: {
            format: 'cjs',
            file: join(__dirname, 'dist', 'StringBean-commonjs.js')
        }
    },
    {
        output: {
            format: 'umd',
            file: join(__dirname, 'dist', 'StringBean-universal.js')
        }
    }
]

const configs = branchConfigs.map(config => deepmerge(baseConfig, config))

configs[1].plugins.splice(0, 1) // Don't include dependencies in node bundle
configs[1].plugins.splice(2) // Don't Uglify the node bundle
export default configs
