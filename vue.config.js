// https://zhuanlan.zhihu.com/p/335684457
'use strict'
const path = require('path')
const IS_PROD = ['production'].includes(process.env.NODE_ENV)

function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  /*
    部署生产环境和开发环境下的URL：可对当前环境进行区分
    部署应用时的基本URL
    如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。
    例如，如果你的应用被部署在 https://www.my-app.com/my-app/，则设置publicPath为/my-app/
   */
  /* publicPath: process.env.NODE_ENV === 'production' ? './' : '/' */
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  /* 输出文件目录:在npm run build时，生成文件的目录名称 */
  outputDir: process.env.outputDir,
  /* 放置生成的静态资源(js、css、img、fonts)的相对于outputDir的目录*/
  assetsDir: 'static',
  /* 指定生成的index.html的输出路径 (相对于outputDir)也可以是一个绝对路径 */
  indexPath: 'index.html',
  /* 在multi-page模式下构建应用。每个“page”应该有一个对应的JavaScript 入口文件 */
  pages: {
    index: {
      entry: 'src/main.js', // page 的入口 必须选项
      template: 'public/index.html', // 模板文件来源 可选
      filename: 'index.html', // 在dist/index.html的输出可选
      title: 'vuedemo', // 当使用title选项时，template中的title标签需要是 <title><%= htmlWebpackPlugin.options.title %></title> 可选项
      chunks: ['chunk-vendors', 'chunk-common', 'index'], //在这个页面中包含的块，默认情况下会包含, 提取出来的通用chunk和vendor,chunk  可选项
    },
    // 当使用只有入口的字符串格式时，
    // 模板会被推导为 `public/subpage.html`
    // 并且如果找不到的话，就回退到 `public/index.html`。
    // 输出文件名会被推导为 `subpage.html`。
    // subpage: 'src/subpage/main.js'
  },
  /* 是否在构建生产包时生成sourceMap文件，false将提高构建速度 */
  productionSourceMap: !IS_PROD, // 生产环境的source map
  /* 默认情况下，生成的静态资源在它们的文件名中包含了hash以便更好的控制缓存,你可以通过将这个选项设为false来关闭文件名哈希。(false的时候就是让原来的文件名不改变) */
  filenameHashing: false,
  // 在生成的HTML中配置crossorigin属性<link rel="stylesheet">和<script>标记。告诉脚本而不发送用户凭据
  crossorigin: undefined,
  /*
    代码保存时进行eslint检测
    是否在保存的时候使用`eslint-loader`进行检查。
    是否在开发环境下通过eslint-loader在每次保存时lint代码(在生产构建时禁用eslint-loader)
  */
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 是否使用包含运行时编译器的Vue构建版本
  runtimeCompiler: false,
  // babel-loader默认会跳过node_modules依赖。通过这个选项可以显式转译一个依赖。
  // Babel 显式转译列表
  transpileDependencies: [], // string or regex
  // 调整内部的webpack配置。
  // 查阅 https://cli.vuejs.org/guide/webpack.html#simple-configuration
  // 如果这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中。
  // 如果这个值是一个函数，则会接收被解析的配置作为参数。该函数既可以修改配置并不返回任何东西，也可以返回一个被克隆或合并过的配置版本
  configureWebpack: (config) => {
    config.resolve = {
      // 配置解析别名
      extensions: ['.js', '.json', '.vue'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        components: path.resolve(__dirname, './src/components'),
      },
    }
  },
  // 对内部的webpack配置（比如修改、增加Loader选项(链式操作)。
  // 首先需要对 @/assets/icons文件夹下的svg图标进行自动注册,需要对webpack和svg-sprite-loader进行了相关设置，文件全部打包成svg-sprite。
  chainWebpack: (config) => {
    // 在svg规则中排除我们的图标库文件夹目录
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    // 创建 icons 规则，设置文件夹包含我们的图标库文件夹目录
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end()
  },
  // CSS 相关选项
  css: {
    // 当为true时,css文件名可省略 module 默认为 false
    requireModuleExtension: false,
    // 是否将组件中的CSS提取至一个独立的CSS文件中,当作为一个库构建时，你也可以将其设置为false免得用户自己导入CSS
    // 默认生产环境下是,true,开发环境下是 false  是否使用css分离插件 ExtractTextPlugin
    extract: false,
    // 是否为CSS开启source map,设置为true之后可能会影响构建的性能
    sourceMap: false,
    // 向CSS相关的loader传递选项(支持css-loader postcss-loader sass-loader less-loader stylus-loader)
    loaderOptions: {
      // 给sass-loader传递选项
      sass: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.sass` 这个文件
        // 注意:在sass-loader v8 中，这个选项名是 "prependData"
        // prependData: `@import "~@/variables.sass"`
      },
      // 默认情况下`sass`选项会同时对`sass` 和 `scss`语法同时生效
      // 因为`scss`语法在内部也是由sass-loader处理的
      // 但是在配置 `prependData` 选项的时候
      // `scss` 语法会要求语句结尾必须有分号，`sass`则要求必须没有分号
      // 在这种情况下，我们可以使用`scss`选项，对`scss`语法进行单独配置
      scss: {
        // prependData:`@import "~@/variables.scss";`
      },
      // 给less-loader传递Less.js相关选项
      less: {
        // http://lesscss.org/usage/#less-options-strict-units `Global Variables`
        // `primary` is global variables fields name
        // `globalVars` 定义全局对象，可加入全局变量
        globalVars: {
          primary: '#fff',
        },
      },
    },
  },
  /* webpack-dev-server相关配置 */
  // 如果你的前端应用和后端API服务器没有运行在同一个主机上，
  // 你需要在开发环境下将API请求代理到API服务器。这个问题可以通过vue.config.js中的 devServer.proxy 选项来配置。
  devServer: {
    overlay: {
      // 让浏览器overlay同时显示警告和错误
      warnings: true,
      errors: true,
    },
    open: true, // 自动打开浏览器
    host: '0.0.0.0', // 设置为0.0.0.0则所有的地址均能访问,
    port: 8066, // 端口号
    https: false, // https:{type:Boolean}
    hotOnly: false, // 热更新
    // 使用代理
    // proxy: 'http://localhost:8080'   // 配置跨域处理,只有一个代理
    proxy: {
      '/api': {
        target: 'http://baidu.com',
        changeOrigin: true,
        // ws: true,//websocket支持
        secure: false,
        pathRewrite: {
          '^/api': '',
        },
      },
      /*
      '/api2': {
        target: 'http://github.com',
        changeOrigin: true,
        // ws: true, websocket支持
        secure: false,
        pathRewrite: {
          '^/api2': '',
        },
      }, */
    },
    // before: app => {}
  },
  // 传递给 PWA 插件的选项。
  // 查阅 https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-pwa
  pwa: {},
  // 在生产环境下为Babel和TypeScript 使用`thread-loader`
  // 在多核机器下会默认开启。
  parallel: require('os').cpus().length > 1,
  // 第三方插件的选项
  pluginOptions: {
    electronBuilder: {
      productName: 'myapp', ////项目名 这也是生成的exe文件的前缀名
      directories: {
        // 输出文件夹
        output: 'build',
      },
      appId: 'com.example.app', //包名
      copyright: 'Copyright © 2021',
      mac: {
        icon: 'public/favicon.ico',
      },
      win: {
        icon: 'public/favicon.ico',
        target: [
          {
            target: 'nsis',
            arch: ['x64'],
          },
        ],
      },
      linux: {
        // 设置linux的图标
        icon: 'public/icons/app.png',
        target: 'AppImage',
      },
      dmg: {
        contents: [
          {
            x: 410,
            y: 150,
            type: 'link',
            path: '/Applications',
          },
          {
            x: 130,
            y: 150,
            type: 'file',
          },
        ],
      },
      // nsis编译选项
      builderOptions: {
        nsis: {
          oneClick: false, // 一键安装
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          installerIcon: './public/icons/app.ico', // 安装图标
          uninstallerIcon: './public/icons/app.ico', //卸载图标
          installerHeaderIcon: './public/icons/app.ico', // 安装时头部图标
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true, // 创建开始菜单图标
          shortcutName: 'chengzhou', // 图标名称
        },
      },
      nodeIntegration: true, // 设置开启nodejs环境
      contextIsolation: false, // electron为12x版本新增此行
      nodeIntegrationInWorker: true, // 是否在Web工作器中启用了Node集成
      removeElectronJunk: false, // 移除Electron有时会产生一堆垃圾输出
    },
  },
}
