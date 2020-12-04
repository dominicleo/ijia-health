# 爱加健康微信小程序 for Remax

## 文档

[remax](https://remaxjs.org/guide/quick-start)

[微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 更新日志

查看[更新日志](/CHANGELOG.md)

## 开始开发

安装依赖

```bash
$ npm install
# 或者用 yarn
$ yarn
```

开始构建

```bash
# 开发环境
$ yarn dev start
# 测试环境
$ yarn dev start:test
# 仿真环境
$ yarn dev start:stage
# 生产环境
$ yarn dev start:prod
```

使用小程序开发者工具打开项目下的 `dist/wechat` 目录。

## 发布

```bash
# 开发环境
$ yarn dev release:dev
# 测试环境
$ yarn dev release:test
# 仿真环境
$ yarn dev release:stage
# 生产环境
$ yarn dev release
```

使用小程序开发者工具上传版本。

## 生成更新日志

```bash
# 版本升级
$ yarn changelog -r major
# 特性更新
$ yarn changelog -r minor
# 修订补丁
$ yarn changelog -r patch
# 或指定版本号
$ yarn changelog -r 1.1.0
```

更多功能[查看文档](https://github.com/conventional-changelog/standard-version)
