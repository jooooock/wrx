# 知乎书店

## 接入任务完成情况

### 图标切换与启用/禁用

- [x] 添加启用匹配规则
- [x] 添加图标切换判断条件

### 数据缓存

- [x] 在`host_permissions`字段中增加相关域名
- [x] 在`xhr-fetch.js`中的`INTERCEPT_APIS`中增加接口匹配规则
- [ ] `content.js`脚本
- [ ] `store.js`脚本
- [ ] `toc.css`样式标记章节缓存状态

### 数据解密

- [x] 逆向解密算法
- [ ] 调整解密端的导出逻辑

### 自动翻页

- [x] `auto.js`脚本


## 额外任务

逆向参数加密逻辑，直接调用接口一键缓存全书，但存在风险，过度使用容易被禁账号。

## 接口分析

### 元数据接口

接口地址:
```http request
GET https://www.zhihu.com/api/v3/books/[bookId]?include=
```

<details>
<summary>查看响应示例</summary>

```json
{
    "read_count": 10618,
    "right": {
        "raw_value": 0,
        "left_top_day_icon": "vip_free_day_icon",
        "main_title": "加入知乎 · 读书会，享会员专属权益",
        "sub_title": "精选好书免费读、折扣购，更有大咖领读经典免费听",
        "value": "0",
        "entrance_url": "zhihu://knowledge_market/purchase/1",
        "left_top_night_icon": "vip_free_night_icon",
        "book_vip_url": "zhihu://knowledge_market/purchase/1",
        "privilege": "会员立享折扣优惠",
        "cashier_url": "zhihu://wallet/cashier/933667430576807936",
        "subscription_id": 2,
        "guidance": "知乎·读书会会员免费读此书，还有更多知乎精选电子书等你免费读～",
        "right_type": 0
    },
    "svip_privileges": false,
    "generation": 1,
    "review_stats": {
        "bad": 3,
        "medium": 13,
        "review_count": 504,
        "score": "4.3",
        "good": 84
    },
    "is_subscribed": false,
    "preface": "一个陌生女人的电话，一起失踪事件，动物医生手岛伯朗卷入一场正在进行的犯罪事件。没有任何线索，甚至连同伴也不能完全信任。那个隐藏在家人中的凶手到底是谁？\n\n「维纳斯」不是某个人，而是存在于我们每个人心中令人疯狂的东西。恶不是一开始就存在，东野圭吾在这本书里诠释了好人是如何变成恶魔的。复杂的情节，反转再反转，但反转的是故事，还是人心？",
    "can_subscribe": false,
    "author_preface": "",
    "sku_id": "1092469025979895808",
    "global_anonymous": 0,
    "words_count": "17.3 万字",
    "table": "- 封面\n- 版权\n- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7\n- 8\n- 9\n- 10\n- 11\n- 12\n- 13\n- 14\n- 15\n- 16\n- 17\n- 18\n- 19\n- 20\n- 21\n- 22\n- 23\n- 24\n- 25\n- 26\n- 27\n- 28\n- 29\n- 30\n- 31",
    "book_version": "190804001",
    "publisher_name": "磨铁图书",
    "id": 119601575,
    "book_hash": "d41d8cd98f00b204e9800998ecf8427e",
    "review_count": 145,
    "title": "危险的维纳斯",
    "is_voted": false,
    "book_size": 911633,
    "comment_count": 504,
    "vote_count": 61,
    "score": 8.4,
    "anonymous_status": 0,
    "type": "ebook",
    "member_role": "normal",
    "on_shelf": false,
    "description": "「维纳斯」不是某个人，而是存在于我们每个人心中令人疯狂的东西。 ",
    "is_purchased": false,
    "qrcode_url": "",
    "is_access_reader": true,
    "collection": {
        "token": "book",
        "surname": "精选",
        "name": "知乎精选好书",
        "id": 0
    },
    "pintag": [],
    "authors": [
        {
            "avatar_url": "https://pic1.zhimg.com/50/v2-beeba36f24b04afe3e3fd689f8bc5c78_qhd.jpg?source=f11ebe26",
            "name": "东野圭吾",
            "url": "",
            "gender": 1,
            "type": "outer_author",
            "id": ""
        }
    ],
    "sales_bubble": {
        "is_pop": false
    },
    "privilege_status": 0,
    "coupons": {
        "status": 0
    },
    "is_own": false,
    "url": "https://www.zhihu.com/pub/book/119601575",
    "message": "",
    "cover": "https://pic1.zhimg.com/v2-c70fa52c486461e7d62f8c1f30269932_200x0.jpg?source=f11ebe26",
    "prompts": [],
    "promotion": {
        "pay_type": "wallet",
        "is_promotion": false,
        "zhihu_bean": 4500,
        "price": 4500,
        "origin_price": 4500
    },
    "on_shelves": true
}
```
</details>

可以通过`include`参数来包含额外信息，格式为:
```js
encodeURIComponent('pub_time,dci_number,dci_cert,categories,authors[*].url_token,is_following,badge[?topics]')
```

### 目录接口

接口地址:
```http request
GET https://www.zhihu.com/api/v3/books/[bookId]/chapters
```

<details>
<summary>查看响应示例</summary>

```json
{
  "deleted": [],
  "updated": [
    {
      "is_own": true,
      "hash": "",
      "title": "\u5c01\u9762",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 1,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "\u5c01\u9762",
      "chapter_uid": "1141324025534943232",
      "is_cover": true,
      "is_trial": true,
      "chapter_index": 0,
      "size": 115
    },
    {
      "is_own": true,
      "hash": "",
      "title": "\u7248\u6743",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 90,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "\u7248\u6743",
      "chapter_uid": "1141324025581142016",
      "is_cover": false,
      "is_trial": true,
      "chapter_index": 1,
      "size": 338
    },
    {
      "is_own": true,
      "hash": "",
      "title": "1",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 1905,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "1",
      "chapter_uid": "1092470252998324224",
      "is_cover": false,
      "is_trial": true,
      "chapter_index": 2,
      "size": 7085
    },
    {
      "is_own": true,
      "hash": "",
      "title": "2",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 9199,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "2",
      "chapter_uid": "1092470253497470976",
      "is_cover": false,
      "is_trial": true,
      "chapter_index": 3,
      "size": 32457
    },
    {
      "is_own": true,
      "hash": "",
      "title": "3",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5527,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "3",
      "chapter_uid": "1092470255116500992",
      "is_cover": false,
      "is_trial": true,
      "chapter_index": 4,
      "size": 19943
    },
    {
      "is_own": true,
      "hash": "",
      "title": "4",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 4666,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "4",
      "chapter_uid": "1092470256202776576",
      "is_cover": false,
      "is_trial": true,
      "chapter_index": 5,
      "size": 16702
    },
    {
      "is_own": true,
      "hash": "",
      "title": "5",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5192,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "5",
      "chapter_uid": "1092470257092042752",
      "is_cover": false,
      "is_trial": true,
      "chapter_index": 6,
      "size": 18162
    },
    {
      "is_own": false,
      "hash": "",
      "title": "6",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5271,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "6",
      "chapter_uid": "1092470258077626368",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 7,
      "size": 19415
    },
    {
      "is_own": false,
      "hash": "",
      "title": "7",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 4988,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "7",
      "chapter_uid": "1092470259155607552",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 8,
      "size": 18159
    },
    {
      "is_own": false,
      "hash": "",
      "title": "8",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 8740,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "8",
      "chapter_uid": "1092470260191559680",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 9,
      "size": 31912
    },
    {
      "is_own": false,
      "hash": "",
      "title": "9",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5849,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "9",
      "chapter_uid": "1092470261810544640",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 10,
      "size": 20711
    },
    {
      "is_own": false,
      "hash": "",
      "title": "10",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 9111,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "10",
      "chapter_uid": "1092470262951383040",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 11,
      "size": 33040
    },
    {
      "is_own": false,
      "hash": "",
      "title": "11",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 4047,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "11",
      "chapter_uid": "1092470264641785856",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 12,
      "size": 15062
    },
    {
      "is_own": false,
      "hash": "",
      "title": "12",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 4367,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "12",
      "chapter_uid": "1092470265463812096",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 13,
      "size": 15373
    },
    {
      "is_own": false,
      "hash": "",
      "title": "13",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5631,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "13",
      "chapter_uid": "1092470266302758912",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 14,
      "size": 20679
    },
    {
      "is_own": false,
      "hash": "",
      "title": "14",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 6821,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "14",
      "chapter_uid": "1092470267426791424",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 15,
      "size": 24744
    },
    {
      "is_own": false,
      "hash": "",
      "title": "15",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 6634,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "15",
      "chapter_uid": "1092470268815089664",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 16,
      "size": 24678
    },
    {
      "is_own": false,
      "hash": "",
      "title": "16",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 4763,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "16",
      "chapter_uid": "1092470270157205504",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 17,
      "size": 17556
    },
    {
      "is_own": false,
      "hash": "",
      "title": "17",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 6931,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "17",
      "chapter_uid": "1092470271147151360",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 18,
      "size": 25016
    },
    {
      "is_own": false,
      "hash": "",
      "title": "18",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5454,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "18",
      "chapter_uid": "1092470272539623424",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 19,
      "size": 20475
    },
    {
      "is_own": false,
      "hash": "",
      "title": "19",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 3543,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "19",
      "chapter_uid": "1092470273605009408",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 20,
      "size": 12967
    },
    {
      "is_own": false,
      "hash": "",
      "title": "20",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5824,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "20",
      "chapter_uid": "1092470274347360256",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 21,
      "size": 20885
    },
    {
      "is_own": false,
      "hash": "",
      "title": "21",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5694,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "21",
      "chapter_uid": "1092470275509133312",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 22,
      "size": 21252
    },
    {
      "is_own": false,
      "hash": "",
      "title": "22",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 6902,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "22",
      "chapter_uid": "1092470277400817664",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 23,
      "size": 25499
    },
    {
      "is_own": false,
      "hash": "",
      "title": "23",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 6125,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "23",
      "chapter_uid": "1092470278780776448",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 24,
      "size": 22558
    },
    {
      "is_own": false,
      "hash": "",
      "title": "24",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 8329,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "24",
      "chapter_uid": "1092470280013897728",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 25,
      "size": 29258
    },
    {
      "is_own": false,
      "hash": "",
      "title": "25",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5087,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "25",
      "chapter_uid": "1092470281523826688",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 26,
      "size": 18790
    },
    {
      "is_own": false,
      "hash": "",
      "title": "26",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 3892,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "26",
      "chapter_uid": "1092470282551427072",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 27,
      "size": 14197
    },
    {
      "is_own": false,
      "hash": "",
      "title": "27",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 2602,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "27",
      "chapter_uid": "1092470283327426560",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 28,
      "size": 9602
    },
    {
      "is_own": false,
      "hash": "",
      "title": "28",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 9352,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "28",
      "chapter_uid": "1092470283914514432",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 29,
      "size": 31836
    },
    {
      "is_own": false,
      "hash": "",
      "title": "29",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 5655,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "29",
      "chapter_uid": "1092470285504180224",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 30,
      "size": 19990
    },
    {
      "is_own": false,
      "hash": "",
      "title": "30",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 3254,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "30",
      "chapter_uid": "1092470286561177600",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 31,
      "size": 11921
    },
    {
      "is_own": false,
      "hash": "",
      "title": "31",
      "new_hash": "",
      "level": 1,
      "is_own_book": false,
      "word_count": 1501,
      "version": "190804001",
      "content_file": "",
      "chapter_title": "31",
      "chapter_uid": "1092470287207133184",
      "is_cover": false,
      "is_trial": false,
      "chapter_index": 32,
      "size": 5872
    }
  ],
  "version": "190804001"
}
```
</details>

### 获取章节的公钥接口

接口地址:
```http request
GET https://www.zhihu.com/api/v3/books/[bookId]/chapters/[chapterUid]/download_info
```

<details>
<summary>查看响应示例</summary>

```json
{
  "key_hash": "E48FBEA6AACC8177E10AF1190421E92B",
  "key": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgkB5vTONXv15SukpyFKKbkO3m\nMbZ8z4u8HwtV14qEoOJaOhh6pu75o6bojX3RFnWm3wHxFjmdJu1+JurChFiY2fxD\nQ+SZWXKzNvfK/fvi3JNMfgVfp0HcuCzKDWE+vPeactLeTNnjFRYlnaUygiwm0KNE\nhDDHw2/41xjcPLmPpQIDAQAB\n-----END PUBLIC KEY-----"
}
```
</details>

其中，`key_hash`参与签名的计算，`key`则用于加密客户端生成的一次性密码参数，加密后通过`trans_key`传给后端。

### 获取章节资源接口

接口地址:
```http request
POST https://www.zhihu.com/api/v3/books/[bookId]/chapters/[chapterUid]/download

client_id: 5774b305d2ae4469a2c9258956ea48
key_hash: E48FBEA6AACC8177E10AF1190421E92B
signature: 4b18cc7ffa392f6687901658c3f14b572e97c4d3
timestamp: 1723791957338
trans_key: 2eg1rIgURbckAtGLuWMEs4ZEWQzYugrFLWnZo+O+qu0GJ2xlACgZ73gIqc0b1M+Dh43RQzH2ElfeBq5mPYoCYWt1Wz56vlfRwcGSiZjImaweKfc/M1SHVCSRrbfKm8VZAhoKBvZKzUb2NV7fWQ9qetOAEIC5YcWEJwnaDlHDtW0=
```

<details>
<summary>查看响应示例</summary>

```json
{
  "format_html_path": "http://book.zhimg.com/chapters/119601575/format_x86bskwm_190804001.html",
  "zip_path": "",
  "key_hash": "4DE1C8950141B0C56FA41E078F4AFFE9",
  "is_access_reader": true,
  "html_path": "http://book.zhimg.com/chapters/119601575/craw5akb_190804001.html",
  "download_url": "",
  "key": "kaxlNCdIny/oMkj3Vgi3YmIwqOoe1BtnnJu+pc/7pfE=",
  "message": "",
  "default_css": "https://book.zhimg.com/books/61E37BD8AC9209F6E3B5C18A7BF231E0.css",
  "css_path": [
    "https://book.zhimg.com/books/61E37BD8AC9209F6E3B5C18A7BF231E0.css",
    "https://book.zhimg.com/books/EC6E21149A53D434CE13B1F13F7C3545.css",
    "https://book.zhimg.com/books/1F451EC236F03D3A1166E4D8540AA024.css"
  ]
}
```

其中，`html_path`字段即为该章节的文件地址，直接下载该文件可得到密文内容。`key`为解密该内容的密码，只不过这个密码不是明文，是经过我们前面生成的那个一次性密码用`aes-128-cfb8`算法加密得到的。
</details>



## 加解密算法分析

### 流程梳理

1. 调用【获取章节的公钥接口】获取到对应章节的公钥`key`和`keyHash`参数
2. 调用【获取章节资源接口】获取章节的html路径，以及解密所需的`key`，参数的签名及加密算法见下面的代码

```ts
// 计算 transKey，使用公钥 key 对 secret 进行加密，即得到 trans_key
function getTransKey(key: string, secret: string) {
    const body = Buffer.alloc(128 - secret.length)
    const buf = Buffer.concat([body, Buffer.from(secret)])
    return crypto.publicEncrypt({
        key: key,
        padding: 3,
    }, buf).toString('base64')
}

// 计算签名
function signPayload(payload: string[]) {
    const e = crypto.createHmac("sha1", "key")
    for (const value of payload) {
        e.update(value)
    }
    return e.digest("hex")
}

// 这两个参数由【获取章节的公钥接口】获取
const key = ''
const key_hash = ''

const client_id = "5774b305d2ae4469a2c9258956ea48";
const timestamp = Number(new Date())

// 生成临时密码
const secret = Array.from({length: 16}).map(() => Math.floor(16 * Math.random()).toString(16).toUpperCase()).join("")

// 对临时密码进行公钥加密，以便在网络上传输
const transKey = getTransKey(key, secret)
const signature = signPayload([chapterUid, transKey, client_id, timestamp, key_hash])
```

3. 下载 html 资源，拿到密文
4. 还原密钥并进行解密

```js
// 用 aes-128-cfb8 算法解密数据
function decrypt(secret, data, encoding) {
    let iv, body;
    if ("string" == typeof data) {
        let buf = Buffer.from(data, "base64");
        iv = Buffer.alloc(16)
        body = Buffer.alloc(buf.length - 16)
        buf.copy(iv, 0, 0, 16)
        buf.copy(body, 0, 16)
    } else {
        iv = data.slice(0, 16)
        body = data.slice(16)
    }
    return crypto.createDecipheriv("aes-128-cfb8", secret, iv).update(body, null, encoding)
}

// secret 即上面生成的临时密码，key是【获取章节资源接口】返回的
const htmlSecret = decrypt(secret, key, 'utf8')

// buffer 为密文内容
const plainText = decrypt(htmlSecret, buffer, 'utf8')
```

### 总结

整个加解密的过程如下：

知乎服务器对每本书的每个章节的`html`内容用`aes-128-cfb8`对称加密算法进行加密，并保存该章节对应的密码(每个章节都有自己的密码，我们称这个密码为`k1`)，只要知道该密码，即可解密`html`内容。

然后浏览器在查看该章节的内容时，会在前端生成一个临时密码(我们称为`k2`)，这个`k2`并不会在网络上传输，只会保留在本地内存中，并且每次生成的都不一样。

然后前端用一对公私钥中的公钥(调接口获取)对`k2`进行加密并传给知乎服务器，由于`k2`是用非对称加密算法加密的，所以只有浏览器前端和知乎知道`k2`的内容。

然后知乎服务器用`k2`作为密码，使用对称加密算法`aes-128-cfb8`对`k1`的明文进行加密，并返回给前端(【获取章节资源接口】所返回的`key`，即`k1`的密文)。

然后前端使用相同的对称加密算法`aes-128-cfb8`解密出`k1`的明文(因为加密的密码就是`k2`)，然后下载html密文，并用`k1`解密其内容。

最后，至于是每个章节都有一对公私钥，还是说所有书籍共用一对公私钥，都无所谓。因为通过网络的数据都不可能解密出`k2`的内容。
