const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const {rimrafSync} = require('rimraf')
const zl = require('zip-lib')

const sourceDir = '../src/'
const outputDir = '../build/'

function resolveSourceFile(file) {
    return path.resolve(__dirname, sourceDir, file)
}
function resolveOutputFile(file) {
    return path.resolve(__dirname, outputDir, file)
}

function copyDirectory(src, dest) {
    fse.copySync(resolveSourceFile(src), resolveOutputFile(dest), {override: true})
}

// xhr-fetch.js 需要混淆
function handleXhrFetchFile() {
    const xhrSource = fs.readFileSync(resolveSourceFile('lib/xhr-fetch.js')).toString('utf-8')
    fs.writeFileSync(resolveOutputFile('lib/x.js'), obfuscate(xhrSource), {encoding: 'utf-8'})
}

// 核心文件需要混淆
function handleContentFile() {
    const utilsSource = fs.readFileSync(resolveSourceFile('lib/utils.js')).toString('utf-8')
    const storeSource = fs.readFileSync(resolveSourceFile('lib/store.js')).toString('utf-8')
    let contentSource = fs.readFileSync(resolveSourceFile('lib/content.js')).toString('utf-8')

    // 改写 xhr-fetch.js 的引入路径
    contentSource = contentSource.replace('lib/xhr-fetch.js', 'lib/x.js')
    // 合并这3个文件之后进行混淆
    const source = `${utilsSource};${storeSource};${contentSource}`
    fs.writeFileSync(resolveOutputFile('lib/content.js'), obfuscate(source), {encoding: 'utf-8'})
}

// 拷贝不需要混淆的文件
function handleManifestFile() {
    ;[
        'assets',
        'lib/crypto-js@4.2.0.min.js',
        'overrides',
        'rules',
        'scripts',
        'background.js',
        'popup.html',
        'toc.css',
    ].forEach(item => copyDirectory(item, item));

    // 处理 manifest.json，因为我们在上面把 3 个文件合并为了 1 个
    const manifest = JSON.parse(fs.readFileSync(resolveSourceFile('manifest.json'), 'utf-8'))
    manifest['web_accessible_resources'][0]['resources'][0] = 'lib/x.js'
    manifest['content_scripts'][0]['js'][1] = 'lib/content.js'
    manifest['content_scripts'][0]['js'].length = 2
    fs.writeFileSync(resolveOutputFile('manifest.json'), JSON.stringify(manifest), 'utf-8')
}

function prepare() {
    rimrafSync(resolveOutputFile('.'))
    fs.mkdirSync(resolveOutputFile('lib'), {recursive: true})
}

function build() {
    prepare()

    handleXhrFetchFile()
    handleContentFile()
    handleManifestFile()
}

build()

function readVersion() {
    const manifest = JSON.parse(fs.readFileSync(resolveSourceFile('manifest.json'), 'utf-8'))
    return manifest.version
}

zl.archiveFolder(resolveOutputFile('.'), resolveOutputFile(`../wrx-${readVersion()}.zip`)).then(() => {
    // rimrafSync(resolveOutputFile('.'))
})
