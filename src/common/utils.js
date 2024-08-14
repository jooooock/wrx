(() => {
    /**
     * 下载文件
     * @param {File} file 文件对象
     */
    function downloadFile(file) {
        const tmpLink = document.createElement("a");
        const objectUrl = URL.createObjectURL(file);

        tmpLink.href = objectUrl;
        tmpLink.download = file.name;
        document.body.appendChild(tmpLink);
        tmpLink.click();

        document.body.removeChild(tmpLink);
        URL.revokeObjectURL(objectUrl);
    }

    function log(msg, ...args) {
        if (typeof msg === 'string') {
            console.debug(`[wrx]: ${msg}`, ...args)
        } else {
            console.debug('[wrx]:', msg, ...args)
        }
    }

    window.wrx_common_utils = {
        downloadFile: downloadFile,
        log: log,
    }
})()
