import path from "node:path";
import {JSDOM} from "jsdom";
import {get, readJson, writeFile} from "../utils.js";

process.on('uncaughtException', (error) => {
    console.log(error)
    // if (error.code !== 'ECONNRESET') {
    // }
})

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
    return [!latest.weread.includes(path.basename(coreJSURL)), coreJSURL]
}

;(async () => {
    const [needUpgrade, url] = await hasNewVersion()
    if (!needUpgrade) {
        console.log('[微信读书]: js文件无变化')
        process.exit(0)
    }

    // 目标url写入临时文件
    writeFile('./weread/tmp/url', url)
})();
