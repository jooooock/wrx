(() => {
    // 需要拦截的api
    const INTERCEPT_APIS = [
        // 微信读书相关接口
        'https://weread.qq.com/web/book/chapter/e_0',
        'https://weread.qq.com/web/book/chapter/e_1',
        'https://weread.qq.com/web/book/chapter/e_2',
        'https://weread.qq.com/web/book/chapter/e_3',
        'https://weread.qq.com/web/book/chapter/t_0',
        'https://weread.qq.com/web/book/chapter/t_1',
        'https://weread.qq.com/web/book/publicinfos',           // 详情数据(未登录 POST)
        'https://weread.qq.com/web/book/publicchapterInfos',    // 章节数据(未登录 POST)
        'https://weread.qq.com/web/book/info',                  // 详情数据(已登录 GET ?bookId=xx)
        'https://weread.qq.com/web/book/chapterInfos',          // 章节数据(已登录 POST)

        // 知乎书店相关接口
        /^https:\/\/www\.zhihu\.com\/api\/v3\/books\/[a-z0-9]+\/chapters$/i,   // 目录数据
        /^https:\/\/www\.zhihu\.com\/api\/v3\/books\/[a-z0-9]+$/i,              // 详情数据
        /^https:\/\/www\.zhihu\.com\/api\/v3\/books\/[a-z0-9]+\/chapters\/[a-z0-9]+\/download$/i, //章节数据
    ]

    // send to content script
    function emit(url, request, response) {
        // if a big media file, can createObjectURL before send to a content script
        //window.postMessage({ response: URL.createObjectURL(response) }, '*');
        window.postMessage({
            from: 'wrx',
            site: url.origin,
            api: url.pathname,
            pathname: url.pathname,
            search: url.search,
            url: url.href,
            request: request,
            response: response,
        }, '*');
    }

    // 拦截 xhr 的请求与响应
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
                const endpoint = url.origin + url.pathname

                // 判断是否命中拦截规则
                const hitRule = INTERCEPT_APIS.some(rule => {
                    if (typeof rule === 'string') {
                        return rule === endpoint
                    } else if (rule instanceof RegExp) {
                        return rule.test(endpoint)
                    } else {
                        return false
                    }
                })
                if (hitRule) {
                    emit(url, postData, this.response)
                }
            }, {once: true});
            return send.apply(this, arguments);
        };
    })(XMLHttpRequest);

    // 重写 fetch，暂时不需要
    const {fetch: origFetch} = window;
    window.fetch = async (...args) => {
        const response = await origFetch(...args);
        response
            .clone()
            .text() // maybe json(), text(), blob(),因为通常电子书接口数据都是文本格式，所以我们用text()
            .then(data => {
                let _url
                let request
                const [resource, options] = args
                if (resource instanceof Request) {
                    _url = resource.url
                    request = options || resource
                } else {
                    _url = resource.toString()
                    request = options
                }
                const url = new URL(_url, window.location.origin)
                const endpoint = url.origin + url.pathname

                // 判断是否命中拦截规则
                const hitRule = INTERCEPT_APIS.some(rule => {
                    if (typeof rule === 'string') {
                        return rule === endpoint
                    } else if (rule instanceof RegExp) {
                        return rule.test(endpoint)
                    } else {
                        return false
                    }
                })
                if (hitRule) {
                    emit(url, request, data)
                }
            })
            .catch(err => console.error(err));
        return response;
    };
})()
