(() => {
    // 需要拦截的api
    const INTERCEPT_APIS = [
        '/web/book/chapter/e_0',
        '/web/book/chapter/e_1',
        '/web/book/chapter/e_2',
        '/web/book/chapter/e_3',
        '/web/book/chapter/t_0',
        '/web/book/chapter/t_1',
        '/web/book/publicinfos', // 详情数据(未登录 POST)
        '/web/book/publicchapterInfos', // 章节数据(未登录 POST)
        '/web/book/info', // 详情数据(已登录 GET ?bookId=xx)
        '/web/book/chapterInfos', // 章节数据(已登录 POST)
    ]

    function emit(url, postData, response) {
        window.postMessage({
            api: url.pathname,
            search: url.search,
            request: postData,
            response: response,
        }, '*');
    }

    // 重写 xhr
    ;(function (XMLHttpRequest) {
        const XHR = XMLHttpRequest.prototype;

        const open = XHR.open;
        const send = XHR.send;

        XHR.open = function (method, url) {
            this._url = url;
            return open.apply(this, arguments);
        };

        XHR.send = function (postData) {
            this.addEventListener('load', () => {
                const url = new URL(this._url, window.location.origin)
                if (INTERCEPT_APIS.includes(url.pathname)) {
                    emit(url, postData, this.response)
                }
            }, {once: true});
            return send.apply(this, arguments);
        };
    })(XMLHttpRequest);

    // 重写 fetch，暂时不需要
    // const {fetch: origFetch} = window;
    // window.fetch = async (...args) => {
    //     const response = await origFetch(...args);
    //     response
    //         .clone()
    //         .blob() // maybe json(), text(), blob()
    //         .then(data => {
    //             window.postMessage({type: 'fetch', data: data}, '*'); // send to content script
    //             //window.postMessage({ type: 'fetch', data: URL.createObjectURL(data) }, '*'); // if a big media file, can createObjectURL before send to a content script
    //         })
    //         .catch(err => console.error(err));
    //     return response;
    // };
})()
