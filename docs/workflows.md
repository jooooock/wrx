# 自动检测并发版

## check-update: 检查微信核心脚本是否有更新

### 运行环境
[Ubuntu2204-Readme.md](https://github.com/actions/runner-images/blob/ubuntu22/20240804.1/images/ubuntu/Ubuntu2204-Readme.md)

### 输出
```yaml
outputs:
  needUpgrade: ${{ steps.step3.outputs.exists }}
```
通过`step3`中的`test`命令来确认是否有新版本文件存在，如果有，则会启动下一个任务进行打包发版。


## build: 打包发版

依赖于`check-update`任务，然后通过以下条件决定是否执行该任务:

```yaml
needs: check-update
if: needs.check-update.outputs.needUpgrade == 'true'
```
