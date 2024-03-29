# wrx 魏如雪

> 该程序由 Github Actions 自动构建，通过 schedule 每个小时执行一次检测，如果发现微读web版有更新，会自动开始新的构建并发布新版本。


## 使用前须知

1. 如果有小号的，尽量用小号使用该插件，因为谁也不知道微信读书的封号策略是什么样的
2. 目前的版本是我比较满意的了，不打算再添加新功能与优化使用体验，后续只会针对可用性的bug进行修复


## 安装
从 [Release 页面](https://github.com/ckcock/wrx/releases)下载最新版本的 wrx.zip 并解压，然后打开 Chrome 插件管理页面(chrome://extensions/)，如下：

![image](assets/1.png)

打开右上角的开发者模式，然后在左上角的 **Load unpacked** 按钮安装这个 **魏如雪** 插件。


## 使用

打开微信读书阅读页面，打开目录弹框，你需要把这些红点点都点成绿色的，如下所示：

![image](assets/2.png)


## 导出

在阅读页面的右上角，点击 **导出本书数据** 按钮，即可将您已阅读部分的数据导出(此数据是加密数据，需要使用 https://weread.deno.dev/ 进行解密)。


## 数据清理

如果您担心该插件缓存的数据太占用空间，或者您仅仅是想知道怎么清除这些缓存的数据，那么您可以打开浏览器的控制台，按照如下操作删除 **IndexedDB** 下面的 **wrx** 数据库即可：

![image](assets/3.png)
