chrome.runtime.onInstalled.addListener(async () => {
    await chrome.action.disable();

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        // 文档: https://developer.chrome.com/docs/extensions/reference/api/declarativeContent
        const readerRule = {
            conditions: [
                // 微信读书
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlPrefix: 'https://weread.qq.com/web/reader/'
                    },
                }),
                // 知乎书店
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlPrefix: 'https://www.zhihu.com/pub/reader/'
                    },
                })
            ],
            actions: [
                // 启用插件
                new chrome.declarativeContent.ShowAction(),
            ],
        };

        const rules = [readerRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
    });
});

chrome.tabs.onUpdated.addListener(async (tabId) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabId === tab?.id) {
        await handleIconChange(tab);
    }
});

chrome.tabs.onActivated.addListener(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await handleIconChange(tab);
});

chrome.runtime.onMessage.addListener(async (data) => {
    if (data.msg === 'updateIcon') {
        const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
        await handleIconChange(tab);
        return true;
    }
});

// 更换插件图标
async function handleIconChange(tab) {
    const {url} = tab

    let iconPath = ''
    if (url && (
        url.startsWith('https://weread.qq.com/web/reader/') ||
        url.startsWith('https://www.zhihu.com/pub/reader/')
    )) {
        iconPath = 'assets/ebook-enabled.png'
    } else {
        iconPath = 'assets/ebook-disabled.png'
    }
    await chrome.action.setIcon({
        tabId: tab.id,
        path: {
            96: iconPath,
        },
    });
}
