import fse from "fs-extra";
import {fileURLToPath} from "node:url";
import fs from "node:fs";
import {readFile, readJson, writeJson} from "../utils.js";
import zl from "zip-lib";
import dayjs from "dayjs";
import path from "node:path";


function readVersion() {
    return readJson('../src/manifest.json').version
}

export async function build() {
    // 拷贝src目录到crx目录
    const src = fileURLToPath(new URL('../../src', import.meta.url))
    const crx = fileURLToPath(new URL('../../crx', import.meta.url))
    fse.copySync(src, crx)

    // 读取 manifest.json 中的版本号
    const version = readVersion()

    const zipPath = fileURLToPath(new URL(`../../releases/wrx-v${version}.zip`, import.meta.url))
    await zl.archiveFolder(crx, zipPath)
    console.log('构建完成')
}

function cleanup() {
    // 读取 manifest.json 中的版本号
    const version = readVersion()

    // 删除 crx 临时目录
    const crx = fileURLToPath(new URL('../../crx', import.meta.url))
    fse.removeSync(crx)

    // 删除 releases 目录下面的老版本
    const files = fs.readdirSync(fileURLToPath(new URL('../../releases', import.meta.url)))
    for (const file of files) {
        if (!file.includes(version)) {
            fse.removeSync(fileURLToPath(new URL(`../../releases/${file}`, import.meta.url)))
        }
    }

    // 记录本次构建的结果
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const latest = readJson('../latest.json')
    latest.version = version
    latest.build_time = now
    const url = readFile('./weread/tmp/url')
    latest.weread.unshift(path.basename(url))
    // 只保留最近10个版本
    if (latest.weread.length > 10) {
        latest.weread.length = 10
    }
    writeJson('../latest.json', latest)

    // 清理weread临时目录
    fse.removeSync(fileURLToPath(new URL('tmp', import.meta.url)))
}


;(async () => {
    await build()
    cleanup()
})();
