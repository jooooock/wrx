(() => {
    // 提前引入的库
    const cryptoJS = window.CryptoJS

    function md5(data) {
        return cryptoJS.MD5(data).toString()
    }

    /**
     * 计算参数的编码
     * @param {string} data
     * @return {string}
     */
    function hash(data) {
        if (typeof data === "number") {
            data = data.toString();
        }
        if (typeof data !== "string") {
            return data;
        }

        const dataMd5 = md5(data);
        let _0x38b4d1 = dataMd5.substr(0, 3);
        const _0x4718f7 = function (data) {
            if (/^\d*$/.test(data)) {
                const dataLen = data.length;
                const _0xd2c2b1 = [];
                for (let i = 0; i < dataLen; i += 9) {
                    const _0x56eaa4 = data.slice(i, Math.min(i + 9, dataLen));
                    _0xd2c2b1.push(parseInt(_0x56eaa4).toString(16));
                }
                return ["3", _0xd2c2b1];
            }

            let _0x397242 = "";
            for (let i = 0; i < data.length; i++) {
                _0x397242 += data.charCodeAt(i).toString(16);
            }
            return ["4", [_0x397242]];
        }(data);

        _0x38b4d1 += _0x4718f7[0];
        _0x38b4d1 += 2 + dataMd5.substr(dataMd5.length - 2, 2);

        const _0x1e41f3 = _0x4718f7[1];
        for (let i = 0; i < _0x1e41f3.length; i++) {
            let _0x5c593c = _0x1e41f3[i].length.toString(16);
            1 === _0x5c593c.length && (_0x5c593c = "0" + _0x5c593c);
            _0x38b4d1 += _0x5c593c;
            _0x38b4d1 += _0x1e41f3[i];
            i < _0x1e41f3.length - 1 && (_0x38b4d1 += "g");
        }

        if (_0x38b4d1.length < 20) {
            _0x38b4d1 += dataMd5.substr(0, 20 - _0x38b4d1.length);
        }

        return _0x38b4d1 + md5(_0x38b4d1).substr(0, 3);
    }

    window.wrx_weread_utils = {
        hash: hash,
    }
})()
