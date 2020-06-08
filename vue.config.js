const env = require("./src/environment").env;
const path = require("path");

// // 压缩优化, 压缩js和css
// const TerserPlugin = require("terser-webpack-plugin");

// // 压缩优化单独的css文件
// const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

// // 分析打包速度
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();

// let plugins = [];
// let optimization = {
//   // tree shaking
//   concatenateModules: true,
//   // 修改某个文件，只有这个文件和 manifest.js 文件的 hash 会发生变化，其他文件的 hash 不变
//   runtimeChunk: {
//     name: "manifest"
//   },
//   // 代码分割，提取js和css文件
//   splitChunks: {
//     chunks: "all",
//     minSize: 55 * 1024,
//     maxSize: 0,
//     minChunks: 1,
//     maxAsyncRequests: 5,
//     maxInitialRequests: Infinity,
//     automaticNameDelimiter: "~",
//     name: true,
//     cacheGroups: {
//       venderVue: {
//         name: true,
//         test: /[\\/]node_modules[\\/](vue|vue-router|vuex)/,
//         priority: 30
//       },
//       venderPixi: {
//         name: true,
//         test: /[\\/]node_modules[\\/](pixi|pixi.js-legacy)/,
//         priority: 20
//       },
//       venderOthers: {
//         name: true,
//         test: /[\\/]node_modules[\\/](raven-js|howler)/,
//         chunks: "all",
//         priority: 10
//       },
//       default: {
//         minChunks: 2,
//         priority: -20,
//         reuseExistingChunk: true
//       }
//     }
//   }
// };

// // dev，使用analyzer
// if (process.env.VUE_APP_IS_LOCAL === "1") {
//   // 打包文件分析可视化
//   const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//     .BundleAnalyzerPlugin;
//   plugins.push(new BundleAnalyzerPlugin());
// }

// // 线上环境和性能优化环境
// if (
//   process.env.VUE_APP_PATH_TYPY === "master" ||
//   process.env.VUE_APP_PATH_TYPY === "best"
// ) {
//   // 基于 babel 的压缩代码
//   const MinifyPlugin = require("babel-minify-webpack-plugin");
//   // 压缩插件
//   plugins.push(
//     new MinifyPlugin(
//       {},
//       {
//         comments: false
//       }
//     )
//   );
//   optimization.minimizer = [
//     new TerserPlugin({
//       // 多进程并行运行提高构建速度
//       parallel: true,
//       sourceMap: false,
//       // 是否启动缓存
//       cache: true,
//       terserOptions: {
//         compress: {
//           warnings: false,
//           // eslint-disable-next-line
//                     drop_console: true,
//           // eslint-disable-next-line
//                     drop_debugger: true,
//           // eslint-disable-next-line
//                     pure_funcs: ['console.log, console.error']
//         }
//       }
//     }),
//     // 压缩并优化css
//     new OptimizeCssAssetsPlugin({
//       // 引入cssnano配置压缩选项
//       cssProcessor: require("cssnano"),
//       cssProcessorOptions: {
//         discardComments: { removeAll: true }
//       },
//       //是否将插件信息打印到控制台
//       canPrint: false
//     })
//   ];
// }

// // dev环境添加SpeedMeasurePlugin插件
// let configure = {
//   plugins: plugins,
//   performance: {
//     hints: "warning",
//     // 入口文件最大体积
//     maxEntrypointSize: 50000000,
//     //生成文件的最大体积
//     maxAssetSize: 50000000
//   },
//   optimization: optimization
// };

// if (process.env.VUE_APP_IS_LOCAL === "1") {
//   configure = smp.wrap(configure);
// }


module.exports = {
  publicPath: env.publicPath + "",
    // configureWebpack: configure,
    chainWebpack: config => {
      config.plugins.delete("prefetch");
      config.output.filename("[name].[hash].js").end();
      if (process.env.VUE_APP_PATH_TYPY !== "master") {
        // 配置mew
        config.module
          .rule("mew")
          .test(/\.(js|json|css|less|md|vue)$/)
          .pre()
          // 源码目录路径
          .include.add(path.resolve(__dirname, "src"))
          .end()
          .use("mew-loader")
          .loader("mew-loader")
          // tap修改参数的方法
          .tap(options => {
            options = {
              failOnError: false,
              failOnWarning: false
            };
            return options;
          });
      }
    },
  css: {
    // 是否使用 css 分离插件 ExtractTextPlugin，采用独立样式文件载入，不采用 <style> 方式内联至 html 文件中
    extract: false,
    sourceMap: false
  },
  // 生产环境 sourceMap
  productionSourceMap: false
};
