# webclient

## 安装依赖
```
npm install
```

## 文档页面

  - 本地搭建好服务器可访问 http://127.0.0.1:8081/doc/

## 目录结构 
``` 
  public/                  index.html模板文件
    index.html             script 方式加载 jsw SDK 
                           script 方式加载 高德地图

  src/                      
    assets/                资源文件
    components/            Vue 封装的组件
    plugins/               插件
    views/                 Vue 页面
    App.vue                Vue Root组件
    main.js                js入口文件
    router.js              Vue-router路由配置文件
    store.js               Vuex存储配置

  static/                  layer 第三方js 引用(资源文件)
  tools/                   封装的翻译工具 (可删)

```


## 运行命令

``` 
开发环境

npm run serve


生产(打包)环境
打包后生成到 dist/ 目录中

npm run build


```


## 运行后注意

  1. 该项目默认运行 https 方式运行
  
  2. 我们的 `语音对讲` 相关的接口需要通过 https 的方式进行访问页面，才能申请麦克风的权限。
  3. 我们的 `接口服务器` https 证书是自签的，如果您运行了该项目并且是https 的方式的话，就需要先打开我们 `接口服务器` 的https页面通过浏览器的警告。这样才能成功调用接口
  


