(() => {
    // 注入自定义的 xhr 和 fetch，实现接口数据的拦截
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('common/xhr-fetch.js');
    script.onload = function () {
        this.remove();
    };
    ;(document.head || document.documentElement).appendChild(script);
})();
