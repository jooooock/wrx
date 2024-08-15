(() => {
    // 在页面添加一个导出按钮
    document.addEventListener('DOMContentLoaded', async () => {
        const parts = window.location.pathname.split('/')
        // 加密的 bookId
        const bid = parts[parts.length - 1].split('k')[0]

        const btn = document.createElement('button')
        btn.textContent = '导出本书数据'
        btn.id = '__wrx_export__'
        btn.style.position = 'fixed'
        btn.style.top = '80px'
        btn.style.right = '20px'
        btn.style.fontSize = '16px'
        btn.style.fontWeight = 'bold'
        btn.style.background = '#e9e9e99c'
        btn.style.color = '#a32727'
        btn.style.padding = '.5em .75em'
        btn.style.borderRadius = '5px'
        btn.style.zIndex = '9999'
        btn.addEventListener('click', async () => {
            try {
                await window.wrx_weread_store.exportBookData(bid)
            } catch (e) {
                alert(e.message)
                console.warn(e)
            }
        })
        document.body.appendChild(btn)

        await window.wrx_weread_store.initBookState(bid)
    })

    // 接收 xhr 拦截的接口数据
    window.addEventListener('message', async ({data}) => {
        if (data && data.from === 'wrx') {
            switch (data.site) {
                case 'https://weread.qq.com':
                    await handleWereadSite(data)
                    break
                default:
                    console.warn('未知网站数据: ', data)
                    break
            }
        }
    });

    // 处理微信读书数据
    async function handleWereadSite(data) {
        let bookId

        const {pathname, search, request, response} = data
        switch (pathname) {
            case '/web/book/chapter/e_0':
            case '/web/book/chapter/e_1':
            case '/web/book/chapter/e_2':
            case '/web/book/chapter/e_3':
            case '/web/book/chapter/t_0':
            case '/web/book/chapter/t_1':
                // 保存 chapter 数据
                const {b: bid, c: cid} = JSON.parse(request)
                await window.wrx_weread_store.storeBookChapter(bid, cid, pathname, response)
                window.wrx_weread_store.markChapterDownloaded(cid)
                break
            case '/web/book/publicinfos':
                bookId = JSON.parse(request).bookIds[0]
                await window.wrx_weread_store.storeBookDetail(bookId, JSON.parse(response))
                break
            case '/web/book/info':
                bookId = new URLSearchParams(search).get('bookId')
                await window.wrx_weread_store.storeBookDetail(bookId, JSON.parse(response))
                break
            case '/web/book/publicchapterInfos':
            case '/web/book/chapterInfos':
                bookId = JSON.parse(request).bookIds[0]
                await window.wrx_weread_store.storeBookToc(bookId, JSON.parse(response))

                // 目录数据缓存之后，更新页面上的目录 dom 上方便后续处理
                await window.wrx_weread_store.updatePageCatalog(window.wrx_weread_utils.hash(bookId))
                break
        }
    }
})();
