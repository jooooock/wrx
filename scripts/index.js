import {
    fetchLatestFile,
    downloadFile,
    checkFileIsUpdated,
    replaceProjectFile,
    updateLatest,
    setupBuildTime
} from './utils.js'
import {transform} from './transformer.js'
import {build} from "./build.js";

process.on('uncaughtException', (error) => {
    if (error.code !== 'ECONNRESET') {
        console.log(error)
    }
})

// 获取最新js文件
const url = await fetchLatestFile()
console.log('最新js文件url: ', url)
if (!checkFileIsUpdated(url)) {
    console.log('js文件无变化')
    process.exit(1)
}

// 设置构建时间
setupBuildTime()

// 下载文件
console.log('开始下载文件: ', url)
const filepath = await downloadFile(url)
console.log(`文件下载完毕(${filepath})`)

// transform文件
console.log('开始执行transform')
transform(filepath)
console.log('transform执行完毕')

// 替换项目中引用的文件名
replaceProjectFile()

// 打包发布release
await build()

// 更新 latest.json
updateLatest()
