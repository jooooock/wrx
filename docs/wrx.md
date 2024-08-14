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
