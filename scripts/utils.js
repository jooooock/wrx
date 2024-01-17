import https from 'node:https'
import {JSDOM} from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import fse from 'fs-extra'
import {fileURLToPath} from 'node:url'

/**
 * GET 拉取文件内容
 * @param url
 * @return {Promise<string>}
 */
function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                // host: "weread.qq.com",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
                referer: "https://weread.qq.com/"
            }
        }, resp => {
            if (resp.statusCode !== 200) {
                reject(new Error(`请求微信(${url})失败: ${resp.statusMessage}(${resp.statusCode})`))
                return
            }

            let body = ''
            resp.on('data', (chunk) => {
                body += chunk.toString()
            });
            resp.on('end', () => {
                resolve(body)
            })
        })
    })
}

export function readFile(relativeFilePath) {
    return fs.readFileSync(new URL(relativeFilePath, import.meta.url), {encoding: 'utf-8'})
}

export function writeFile(relativeFilePath, content) {
    const target = fileURLToPath(new URL(relativeFilePath, import.meta.url))
    fse.ensureDirSync(path.dirname(target), {})

    fs.writeFileSync(target, content, {encoding: 'utf-8'})
    return target
}

export function readJson(relativeFilePath) {
    return JSON.parse(fs.readFileSync(new URL(relativeFilePath, import.meta.url), {encoding: 'utf-8'}))
}
export function writeJson(relativeFilePath, json) {
    const target = fileURLToPath(new URL(relativeFilePath, import.meta.url))
    fse.ensureDirSync(path.dirname(target), {})

    fs.writeFileSync(target, JSON.stringify(json, null, 2), {encoding: 'utf-8'})
    return target
}

// 获取最新的js文件地址
export async function fetchLatestFile() {
    const html = await get('https://weread.qq.com/web/reader/22a327a0813ab86fbg010c7d')
    const dom = new JSDOM(html)
    const scripts = dom.window.document.querySelectorAll('script')
    if (scripts.length <= 0) {
        throw new Error('拉取的html中没有发现script元素')
    }
    return scripts[scripts.length - 1].attributes.getNamedItem('src').value
}

export async function downloadFile(url) {
    const content = await get(url)
    return writeFile(`../js/raw/${path.basename(url)}`, content)
}

export function checkFileIsUpdated(url) {
    const latest = readJson('../latest.json')
    return !latest.overrides.includes(path.basename(url))
}

export function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(resolve, duration)
    })
}

export function replaceProjectFile() {
    // 覆盖 overrides 目录
    const src = new URL('../js/overrides', import.meta.url)
    const dest = new URL('../src/overrides', import.meta.url)
    fse.copySync(fileURLToPath(src), fileURLToPath(dest), {overwrite: true})

    // 重新生成 rule.json
    const files = fs.readdirSync(fileURLToPath(src))
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
                "extensionPath": "/overrides/" + filename
            }
        }
    }))
    writeFile('../src/rules/rule.json', JSON.stringify(ruleJson))

    // 更新 manifest.json
    const latest = readJson('../latest.json')
    const manifest = JSON.parse(readFile('../src/manifest.json'))
    manifest.version = incrementVersion(latest.version)
    manifest.version_name = latest.version_name
    manifest["web_accessible_resources"][1]["resources"] = files.map(filename => `/overrides/${filename}`)
    writeFile('../src/manifest.json', JSON.stringify(manifest, null, 2))
}

/**
 * 递增版本号
 * @param version
 * @return {string}
 */
export function incrementVersion(version) {
    const parts = version.split('.').reverse()
    let i = 0
    while (parts[i] >= 9) {
        i++
        if (i >= parts.length) {
            throw new RangeError('version已超出可用范围')
        }
    }
    parts[i]++
    while (i >= 1) {
        parts[i-1]=0
        i--
    }
    return parts.reverse().join('.')
}

export function setupBuildTime() {
    const date = new Intl.DateTimeFormat("zh-CN", {
        dateStyle: "short",
        timeStyle: "medium",
        timeZone: "Asia/Shanghai",
    }).format(new Date());
    const latest = readJson('../latest.json')
    latest.version_name = date
    writeJson('../latest.json', latest)
}

export function updateLatest() {
    const src = new URL('../js/overrides', import.meta.url)
    const files = fs.readdirSync(fileURLToPath(src))

    const latest = readJson('../latest.json')
    latest.version = incrementVersion(latest.version)
    latest.overrides = files

    writeJson('../latest.json', latest)
}
