(() => {
    // 打开数据库
    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open('wrx', 1);
            request.onerror = (evt) => {
                reject(evt)
            }
            request.onsuccess = () => {
                resolve(request.result)
            }
            request.onupgradeneeded = () => {
                const db = request.result

                // 创建 v1 版本相关的数据库
                db.createObjectStore("chapters", {keyPath: 'bid'})
                db.createObjectStore("tocs", {keyPath: 'bid'})
                db.createObjectStore("details", {keyPath: 'bid'})
            }
        })
    }


    // 存储 chapter 数据
    async function storeBookChapter(bid, cid, pathname, content) {
        const db = await openDatabase()

        return new Promise((resolve, reject) => {
            const chapterStore = db.transaction('chapters', 'readwrite').objectStore('chapters')
            const request = chapterStore.get(bid)
            request.onsuccess = () => {
                let chapterObj = request.result
                if (!chapterObj) {
                    chapterObj = {
                        bid: bid,
                        chapters: [],
                    }
                }
                let chapter = chapterObj.chapters.find(chapter => chapter.cid === cid)
                if (!chapter) {
                    chapter = {
                        cid: cid,
                    }
                    chapterObj.chapters.push(chapter)
                }
                chapter[pathname] = content

                // 写入store
                chapterStore.put(chapterObj)
                resolve()
            }
            request.onerror = (evt) => {
                reject(evt)
            }
        })
    }

    // 存储 toc 数据
    async function storeBookToc(bookId, response) {
        const db = await openDatabase()

        return new Promise((resolve, reject) => {
            const tocStore = db.transaction('tocs', 'readwrite').objectStore('tocs')
            const bid = window.wrx_weread_utils.hash(bookId)
            const request = tocStore.get(bid)
            request.onsuccess = () => {
                let tocObj = request.result
                if (!tocObj) {
                    tocObj = {
                        bid: bid,
                        bookId: bookId,
                        toc: response.data[0].updated,
                    }
                }
                tocStore.put(tocObj)
                resolve()
            }
            request.onerror = (evt) => {
                reject(evt)
            }
        })
    }

    // 存储 detail 数据
    async function storeBookDetail(bookId, response) {
        const db = await openDatabase()

        return new Promise((resolve, reject) => {
            const detailStore = db.transaction('details', 'readwrite').objectStore('details')
            const bid = window.wrx_weread_utils.hash(bookId)
            const request = detailStore.get(bid)
            request.onsuccess = () => {
                let detailObj = request.result
                if (!detailObj) {
                    detailObj = {
                        bid: bid,
                        bookId: bookId,
                        detail: response,
                    }
                }
                detailStore.put(detailObj)
                resolve()
            }
            request.onerror = (evt) => {
                reject(evt)
            }
        })
    }

    // 更新页面目录
    async function updatePageCatalog(bid) {
        const db = await openDatabase()

        return new Promise((resolve, reject) => {
            const tocStore = db.transaction('tocs', 'readonly').objectStore('tocs')
            const request = tocStore.get(bid)
            request.onsuccess = () => {
                const tocObj = request.result

                if (tocObj && Array.isArray(tocObj.toc) && tocObj.toc.length > 0) {
                    // 避免重复更新
                    const $ul = document.querySelector('.readerCatalog ul')
                    if ($ul.dataset.updated === '1') {
                        resolve()
                        return
                    }

                    // 需要把 toc 转成扁平结构
                    for (let i = 0; i < tocObj.toc.length; i++) {
                        const chapter = tocObj.toc[i]

                        chapter.level = chapter.level || 1

                        if (Array.isArray(chapter.anchors) && chapter.anchors.length > 0) {
                            const anchors = chapter.anchors.filter(_ => _.level > 1)
                            delete chapter['anchors']
                            // 过滤掉与大标题一样的，参考这本书: https://weread.qq.com/web/reader/739322a07269560473951d3
                            const anchorChapters = anchors.filter(_ => _.title !== chapter.title).map((anchor) => ({
                                ...chapter,
                                title: anchor.title,
                                level: anchor.level,
                                anchor: anchor.anchor,
                                isAnchor: true,
                            }))

                            // 把 anchor 插入到顶层位置
                            tocObj.toc.splice(i+1, 0, ...anchorChapters)
                        }
                    }

                    const tocHasCover = tocObj.toc[0].title === '封面'
                    const $lis = $ul.querySelectorAll('li')
                    const catalogHasCover = $lis[0].textContent === '封面'
                    for (let i = 0; i < $lis.length; i++) {
                        const $li = $lis[i]
                        // 找到对应的目录信息
                        // txt书籍需要去掉标题开头的 第*章
                        const re = /^第\d+?章\s/
                        const liTitle = $li.textContent.replace(re, '')

                        // 页面上的 li 元素对应 toc 中的数据
                        let tocData
                        if (!catalogHasCover && tocHasCover) {
                            tocData = tocObj.toc[i+1]
                        } else {
                            tocData = tocObj.toc[i]
                        }

                        // 这里需要把   替换成普通空格
                        if (tocData.title.replace(re, '').replace(/\[\d+]/g, '').replaceAll(' ', ' ').replaceAll('\'', ' ') === liTitle) {
                            $li.dataset.cid = window.wrx_weread_utils.hash(tocData.chapterUid)
                        } else {
                            // console.log(tocData.title)
                            // console.log(liTitle)
                            console.warn(`这本书(${bid})的目录数据需要特殊适配，请联系开发者`)
                        }
                    }

                    $ul.dataset.updated = '1'
                    resolve()
                }
            }
            request.onerror = (evt) => {
                reject(evt)
            }
        })
    }

    // 标记对应章节的下载状态
    function markChapterDownloaded(cid) {
        document.querySelectorAll(`li[data-cid="${cid}"]`).forEach($li => {
            $li.dataset.downloaded = '1'
        })

        if (checkWholeBookDownloaded()) {
            // 标记整本书下载完成
            markBookDownloaded()
        }
    }

    // 标记整本书已下载完整
    function markBookDownloaded() {
        const targetDom = document.querySelector('.readerCatalog > .readerCatalog_bookInfo')
        if (targetDom.dataset.downloaded === '1') {
            return
        }
        targetDom.dataset.downloaded = '1'
        const btn = document.querySelector('#__wrx_export__')
        if (btn) {
            btn.textContent += ' (全)'
            btn.style.background = 'green'
            btn.style.color = 'white'
        }
    }

    // 检查整本书是否下载完整
    function checkWholeBookDownloaded() {
        const $lis = document.querySelectorAll('.readerCatalog ul > li')
        return Array.from($lis).every($li => $li.dataset.downloaded === '1')
    }

    // 从缓存中读取数据更新到页面
    async function initBookState(bid) {
        // 初始化 catalog
        await updatePageCatalog(bid)

        setTimeout(async () => {
            const db = await openDatabase()
            const chapterStore = db.transaction('chapters', 'readonly').objectStore('chapters')
            const request = chapterStore.get(bid)
            request.onsuccess = () => {
                let chapterObj = request.result
                if (!chapterObj) {
                    return
                }
                chapterObj.chapters.forEach(chapter => {
                    markChapterDownloaded(chapter.cid)
                })
            }
        }, 500)
    }

    // 导出缓存中的书籍数据
    async function exportBookData(bid) {
        const db = await openDatabase()

        return new Promise((resolve, reject) => {
            const tx = db.transaction(['chapters', 'tocs', 'details'], 'readonly')
            const chapterStore = tx.objectStore('chapters')
            const tocStore = tx.objectStore('tocs')
            const detailStore = tx.objectStore('details')

            const chapterRequest = chapterStore.get(bid)
            chapterRequest.onsuccess = () => {
                let chapterObj = chapterRequest.result
                if (!chapterObj || !Array.isArray(chapterObj.chapters)) {
                    reject(new Error('数据不完整，缺少chapters'))
                    return
                }

                const tocRequest = tocStore.get(bid)
                tocRequest.onsuccess = () => {
                    let tocObj = tocRequest.result
                    if (!tocObj || !Array.isArray(tocObj.toc)) {
                        reject(new Error('数据不完整，缺少目录'))
                        return
                    }

                    const detailRequest = detailStore.get(bid)
                    detailRequest.onsuccess = () => {
                        let detailObj = detailRequest.result
                        if (!detailObj || !detailObj.detail) {
                            reject(new Error('数据不完整，缺少元数据'))
                            return
                        }

                        const book = {
                            bid: tocObj.bid,
                            bookId: tocObj.bookId,
                            toc: tocObj.toc,
                            meta: detailObj.detail,
                            chapters: chapterObj.chapters,
                            site: window.location.origin,
                            date: new Date().getTime(),
                        }
                        const file = new File([JSON.stringify(book)], detailObj.detail.title + ".json", {
                            type: "application/json",
                        })
                        window.wrx_common_utils.downloadFile(file)
                        resolve()
                    }
                    detailRequest.onerror = (evt) => {
                        reject(evt)
                    }
                }
                tocRequest.onerror = (evt) => {
                    reject(evt)
                }
            }
            chapterRequest.onerror = (evt) => {
                reject(evt)
            }
        })
    }

    window.wrx_weread_store = {
        storeBookChapter: storeBookChapter,
        storeBookToc: storeBookToc,
        storeBookDetail: storeBookDetail,
        updatePageCatalog: updatePageCatalog,
        markChapterDownloaded: markChapterDownloaded,
        initBookState: initBookState,
        exportBookData: exportBookData,
    }
})()
