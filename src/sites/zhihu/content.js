(() => {
    console.log(123)
    // 接收 xhr 拦截的接口数据
    window.addEventListener('message', async ({data}) => {
        if (data && data.from === 'wrx') {
            switch (data.site) {
                case 'https://www.zhihu.com':
                    await handleZhihuSite(data)
                    break
                default:
                    console.warn('未知网站数据: ', data)
                    break
            }
        }
    });

    // 处理知乎书店数据
    async function handleZhihuSite(data) {
        let bookId

        console.log(data)
        const {api, search, request, response} = data
    }
})();
