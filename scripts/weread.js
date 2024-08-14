import {JSDOM} from "jsdom";
import {get, readJson, replaceProjectFile, writeFile} from "./utils.js";
import path from "node:path";
import {transform} from "./transformer.js";


/**
 * 检测微信读书是否有更新
 */
async function hasNewVersion() {
    const {body: html} = await get('https://weread.qq.com/web/reader/22a327a0813ab86fbg010c7d')
    const dom = new JSDOM(html)
    const scripts = dom.window.document.querySelectorAll('script')
    if (scripts.length <= 0) {
        throw new Error('拉取的html中没有发现script元素')
    }

    // 最后一个 script 元素
    const lastScript = scripts[scripts.length - 1]
    const coreJSURL = lastScript.src
    console.log('[微信读书]: 最新的js文件url: ', coreJSURL)

    const latest = readJson('../latest.json')
    return [!latest.weread.includes(coreJSURL), coreJSURL]
}

async function patchFile(url) {
    const {body: content, headers} = await get(url)
    const info = `url: ${url}\nlast-modified: ${headers["last-modified"]}\netag: ${headers['etag']}\n\n`
    writeFile('../history.txt', info, 'as')
    const filepath = writeFile(`../js/raw/${path.basename(url)}`, content)
    transform(filepath)

    // 替换项目中引用的文件名
    replaceProjectFile()
}

;(async () => {
    const [needUpgrade, url] = await hasNewVersion()
    if (!needUpgrade) {
        console.log('[微信读书]: js文件无变化')
        process.exit(1)
    }

    await patchFile(url)
})();
