(() => {
    let db

    const request = window.indexedDB.open('wrx', 1);
    request.onsuccess = (evt) => {
        db = evt.target.result
    }
    request.onupgradeneeded = (evt) => {
        db = evt.target.result

        db.createObjectStore("chapters", {keyPath: 'bid'})
        db.createObjectStore("tocs", {keyPath: 'bid'})
        db.createObjectStore("details", {keyPath: 'bid'})
    }


    // 存储 chapter 数据
    function storeBookChapter(bid, cid, type, content) {
        // console.debug('[wrx] storeBookChapter: ', bid, cid, type)

        const chapterStore = db.transaction('chapters', 'readwrite').objectStore('chapters')
        chapterStore.get(bid).onsuccess = (evt) => {
            let chapterObj = evt.target.result
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
                    chapterUid: '',
                    version: new Date().getTime(),
                }
                chapterObj.chapters.push(chapter)
            }
            chapter[type] = content

            // 写入store
            chapterStore.put(chapterObj)
        }
    }

    // 存储 toc 数据
    function storeBookToc(bookId, response) {
        // console.debug('[wrx] storeBookToc: ', bookId)

        const tocStore = db.transaction('tocs', 'readwrite').objectStore('tocs')
        const bid = window.utils.hash(bookId)
        tocStore.get(bid).onsuccess = (evt) => {
            let tocObj = evt.target.result
            if (!tocObj) {
                tocObj = {
                    bid: bid,
                    bookId: bookId,
                    toc: response.data[0].updated,
                }
                tocStore.put(tocObj)
            }
        }
    }

    // 存储 detail 数据
    function storeBookDetail(bookId, response) {
        // console.debug('[wrx] storeBookDetail: ', bookId)

        const detailStore = db.transaction('details', 'readwrite').objectStore('details')
        const bid = window.utils.hash(bookId)
        detailStore.get(bid).onsuccess = (evt) => {
            let detailObj = evt.target.result
            if (!detailObj) {
                detailObj = {
                    bid: bid,
                    bookId: bookId,
                    detail: response,
                }
                detailStore.put(detailObj)
            }
        }
    }

    // 更新页面目录
    function updatePageCatalog(bid) {
        // console.debug('[wrx] updatePageCatalog: ', bid)

        const tocStore = db.transaction('tocs', 'readonly').objectStore('tocs')
        tocStore.get(bid).onsuccess = (evt) => {
            const tocObj = evt.target.result
            // console.debug('[wrx] tocObj: ', tocObj)
            if (tocObj && Array.isArray(tocObj.toc) && tocObj.toc.length > 0) {
                // 避免重复更新
                const $ul = document.querySelector('.readerCatalog ul')
                if ($ul.dataset.updated === '1') {
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

                    let tocData
                    if (!catalogHasCover && tocHasCover) {
                        tocData = tocObj.toc[i+1]
                    } else {
                        tocData = tocObj.toc[i]
                    }
                    // 这里需要把   替换成普通空格
                    if (tocData.title.replace(re, '').replaceAll(' ', ' ') === liTitle) {
                        $li.dataset.chapterIdx = tocData.chapterIdx
                        $li.dataset.chapterUid = tocData.chapterUid
                        $li.dataset.cid = window.utils.hash(tocData.chapterUid)
                    } else {
                        console.warn('这本书的目录数据需要特殊适配，请联系开发者')
                    }
                }
                $ul.dataset.updated = '1'
            }
        }
    }

    /**
     * 标记对应章节的下载状态
     * @param bid bookId
     * @param cid chapterUId
     */
    function markChapterDownloaded(bid, cid) {
        // console.debug('[wrx] updateChapterDownloadState: ', bid, cid)

        document.querySelectorAll(`li[data-cid="${cid}"]`).forEach($li => {
            $li.dataset.downloaded = '1'
        })

        if (checkWholeBookDownloaded()) {
            // 标记整本书下载完成
            markBookDownloaded()
        }
    }

    /**
     * 标记整本书已下载完整
     */
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

    /**
     * 检查整本书是否下载完整
     */
    function checkWholeBookDownloaded() {
        const $lis = document.querySelectorAll('.readerCatalog ul > li')
        return Array.from($lis).every($li => $li.dataset.downloaded === '1')
    }

    // 从缓存中读取数据更新到页面
    function initBookState(bid) {
        // console.debug('[wrx] initBook: ', bid)

        // 初始化 catalog
        updatePageCatalog(bid)

        setTimeout(() => {
            const chapterStore = db.transaction('chapters', 'readonly').objectStore('chapters')
            chapterStore.get(bid).onsuccess = (evt) => {
                let chapterObj = evt.target.result
                if (!chapterObj) {
                    return
                }
                chapterObj.chapters.forEach(chapter => {
                    markChapterDownloaded(bid, chapter.cid)
                })
            }
        }, 500)
    }

    // 导出缓存中的书籍数据
    function exportBookData(bid) {
        // console.debug('[wrx] exportBookData: ', bid)

        const chapterStore = db.transaction('chapters', 'readonly').objectStore('chapters')
        chapterStore.get(bid).onsuccess = (evt) => {
            let chapterObj = evt.target.result

            const tocStore = db.transaction('tocs', 'readonly').objectStore('tocs')
            tocStore.get(bid).onsuccess = (evt) => {
                let tocObj = evt.target.result

                const detailStore = db.transaction('details', 'readonly').objectStore('details')
                detailStore.get(bid).onsuccess = (evt) => {
                    let detailObj = evt.target.result

                    const book = {
                        toc: tocObj,
                        detail: detailObj,
                        chapters: chapterObj,
                    }
                    const file = new File([JSON.stringify(book)], detailObj.detail.title + ".json", {
                        type: "application/json",
                    })
                    window.utils.downloadFile(file)
                }
            }
        }
    }

    window.store = {
        storeBookChapter: storeBookChapter,
        storeBookToc: storeBookToc,
        storeBookDetail: storeBookDetail,
        updatePageCatalog: updatePageCatalog,
        markChapterDownloaded: markChapterDownloaded,
        initBookState: initBookState,
        exportBookData: exportBookData,
    }
})()
