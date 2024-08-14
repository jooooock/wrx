import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import fse from 'fs-extra'
import {fileURLToPath} from 'node:url'


/**
 * GET 拉取文件内容
 * @param url
 * @return {Promise<string>}
 */
export function get(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
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
                resolve({
                    body: body,
                    headers: resp.headers,
                })
            })
        })
    })
}

export function readFile(relativeFilePath) {
    return fs.readFileSync(new URL(relativeFilePath, import.meta.url), {encoding: 'utf-8'})
}

export function writeFile(relativeFilePath, content, flag = 'w') {
    const target = fileURLToPath(new URL(relativeFilePath, import.meta.url))
    fse.ensureDirSync(path.dirname(target), {})

    fs.writeFileSync(target, content, {encoding: 'utf-8', flag: flag})
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


export function sleep(duration) {
    return new Promise(resolve => {
        setTimeout(resolve, duration)
    })
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
