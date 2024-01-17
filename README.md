# wrx 魏如雪


## 8.js修改内容 (现在被替换成了6.js了)
1. `eventProtect`方法注释掉如下内容:
   ![eventProtect注释掉body](assets/img_2.png)

2. 下面这4个方法去掉坐标大小的判断
- `handleClickNextChapterButton`
- `handleClickPrevChapterButton`
- `handleClickPrevSectionButton`
- `handleClickNextSectionButton`

替换前：
![handleClickNextChapterButton替换前](assets/img_3.png)

替换后：
![handleClickNextChapterButton替换后](assets/img_4.png)

最终结果：
![最终替换结果](assets/img_1.png)

## 以上修改可以通过执行`yarn transform`脚本进行处理。
