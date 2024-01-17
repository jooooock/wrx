import zl from 'zip-lib'
import {fileURLToPath} from 'node:url'
import {readJson} from './utils.js'
import fse from 'fs-extra'

function readVersion() {
    return readJson('../src/manifest.json').version
}

export async function build() {
    const src = fileURLToPath(new URL('../src', import.meta.url))
    const crx = fileURLToPath(new URL('../crx', import.meta.url))
    fse.copySync(src, crx)
    const zip = fileURLToPath(new URL(`../releases/wrx-${readVersion()}.zip`, import.meta.url))
    await zl.archiveFolder(crx, zip)
    console.log('构建完成')
    fse.removeSync(crx)
}
