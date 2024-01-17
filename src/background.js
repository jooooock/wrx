chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        const readerRule = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlPrefix: 'https://weread.qq.com/web/reader/'
                    },
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()],
        };

        const rules = [readerRule];
        chrome.declarativeContent.onPageChanged.addRules(rules);
    });
});
