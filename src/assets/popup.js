document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#start').addEventListener('click', async (evt) => {
        evt.preventDefault()

        const formData = new FormData(document.querySelector('form'))
        const direction = formData.get('direction')
        let interval = parseInt(formData.get('interval').toString())
        if (Number.isNaN(interval)) {
            interval = 5
        }
        const isScroll = formData.get('isScroll') === 'on'

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "start",
                args: {
                    direction: direction,
                    interval: interval,
                    isScroll: isScroll,
                },
            })
        });
    })
    document.querySelector('#stop').addEventListener('click', (evt) => {
        evt.preventDefault()

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "stop",
            })
        });
    })
})
