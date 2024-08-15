import path from "node:path";
import {get, incrementVersion, readFile, readJson, writeFile} from "../utils.js";
import {transform} from "./transformer.js";
import fse from "fs-extra";
import {fileURLToPath} from "node:url";
import fs from "node:fs";


process.on('uncaughtException', (error) => {
    console.log(error)
    // if (error.code !== 'ECONNRESET') {
    // }
})

async function patchFile(url) {
    const {body: content, headers} = await get(url)
    const info = `url: ${url}\nlast-modified: ${headers["last-modified"]}\netag: ${headers['etag']}\n\n`
    writeFile('../history.txt', info, 'as')

    // 写入临时目录
    const patchedContent = transform(content)
    writeFile(`./weread/tmp/${path.basename(url)}`, patchedContent)
}

function replaceProjectFile(url) {
    // 更新 overrides 目录，保留最新的10个文件
    const latest = readJson('../latest.json')
    const overridesFiles = fs.readdirSync(fileURLToPath(new URL('../../src/overrides/weread', import.meta.url)))
    for (const file of overridesFiles) {
        if (!latest.weread.includes(file)) {
            fse.removeSync(fileURLToPath(new URL(`../../src/overrides/weread/${file}`, import.meta.url)))
        }
    }

    // 将最新的补丁文件拷贝到 overrides 目录
    const latestJs = new URL(`./tmp/${path.basename(url)}`, import.meta.url)
    const dest = new URL('../../src/overrides/weread', import.meta.url)
    fse.copySync(fileURLToPath(latestJs), fileURLToPath(new URL(`../../src/overrides/weread/${path.basename(url)}`, import.meta.url)))

    // 基于最新的 overrides 目录生成规则文件
    const files = fs.readdirSync(fileURLToPath(dest))
    let counter = 1
    const ruleJson = files.map(filename => ({
        "id": counter++,
        "priority": 1,
        "condition": {
            "urlFilter": filename
        },
        "action": {
            "type": "redirect",
            "redirect": {
                "extensionPath": "/overrides/weread/" + filename
            }
        }
    }))
    writeFile('../src/rules/weread.json', JSON.stringify(ruleJson, null, 2))

    // 更新 manifest.json
    const manifest = readJson('../src/manifest.json')
    manifest.version = incrementVersion(latest.version)
    manifest["web_accessible_resources"][1]["resources"] = files.map(filename => `/overrides/weread/${filename}`)
    writeFile('../src/manifest.json', JSON.stringify(manifest, null, 2))
}

;(async () => {
    const url = readFile('./weread/tmp/url')

    await patchFile(url)
    replaceProjectFile(url)
})();
