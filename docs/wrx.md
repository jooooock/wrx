# wrx 插件相关说明

## 缓存数据结构

### `chapters` store

用于存储章节内容。

对象数据结构如下:

```ts
// key 采用【书籍id】
const key = `${bid}`

// value
interface StoreObjectValue {
    /**
     * 书籍id (keyPath)
     */
    bid: string

    /**
     * 书籍的所有章节数据
     */
    chapters: any[]
}
```

### `tocs` store

用于存储目录内容。

对象数据结构如下:

```ts
// key 采用【书籍id】
const key = `${bid}`

// value
interface StoreObjectValue {
    /**
     * 书籍id (keyPath)
     */
    bid: string
    
    bookId: string

    /**
     * 书籍的目录数据
     */
    toc: any[]
}
```


### `details` store

用于存储书籍的元数据。

对象数据结构如下:

```ts
// key 采用【书籍id】
const key = `${bid}`

// value
interface StoreObjectValue {
    /**
     * 书籍id (keyPath)
     */
    bid: string
    
    bookId: string

    /**
     * 书籍的目录数据
     */
    detail: any
}
```

### 数据导出的 json 结构

```json5
{
  // 加密的 bookId
  bid: "d733256071eeeed9d7322fd",
  
  // 原始的 bookId
  bookId: "32435929",
  
  // 目录
  toc: [],
  
  // 元数据
  meta: {},
  
  // 章节数据
  chapters: [],
  
  // 网站
  site: "https://weread.qq.com",
  
  // 导出时间
  date: 1723566852598,
}
```

## 添加新的网站支持需要做的事情

### 图标切换与启用/禁用

修改`src/background.js`，增加相应的规则及判断条件。

### 缓存数据

修改`src/manifest.json`文件中的`host_permissions`字段，将目标网站及接口的域名包含进来。

修改`src/common/xhr-fetch.js`文件中的`INTERCEPT_APIS`，增加目标网站的数据接口拦截规则。
该规则可以是字符串，也可以是正则表达式，都将匹配接口的`origin + pathname`。

在`src/sites`目录下新建对应网站的目录，比如叫`weread`，来存放需要注入到该网站的脚本与样式文件。

该目录中需要包含以下这些文件:

#### 1. content.js 
该文件负责在页面上添加【导出本书数据】按钮，同时需要接收`xhr-fetch`发送过来的接口数据(通过`message`事件)。

#### 2. store.js
创建`wrx`数据库，并提供数据存储与导出相关功能，供`content.js`文件使用

#### 3. toc.css
在书籍的目录上添加标记，方便查看哪些章节已下载，哪些章节未下载。

#### 4. 其他一些工具函数

最后，在`src/manifest.json`文件的`content_scripts`中注入这些资源。

### 自动翻页
在对应网站目录下新建`auto.js`，这个脚本会被注入到目标页面中，负责接收`popup`发送过来的事件，并执行按钮点击动作。
