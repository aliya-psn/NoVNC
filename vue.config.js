const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin // 代码分析工具
const path = require('path')
const Timestamp = new Date().getTime() //随机时间戳

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    lintOnSave: false,
    css: {
        sourceMap: process.env.NODE_ENV === 'development',
        extract: {
            // 修改打包后css文件名   // css打包文件，添加时间戳
            filename: `css/[name].${Timestamp}.css`,
            chunkFilename: `css/[name].${Timestamp}.css`
        }
    },
    devServer: {
        port: 8088,
        proxy: {
            '/api': {
                target: process.env.VUE_APP_API_BASE_URL,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/vnc': {
                target: process.env.VUE_APP_API_VNC_URL,
                changeOrigin: true,
                secure: false,
                ws: true,
                pathRewrite: {
                    '^/vnc': ''
                }
            }
        }
    },
    configureWebpack: {
        devtool: 'source-map',
        output: {
            filename: `js/[name].${Timestamp}.js`,
            chunkFilename: `js/[name].${Timestamp}.js`
        }
    },
    chainWebpack: config => {
        config.module.rules.delete('svg')
        config.resolve.symlinks(true)
        config.module
            .rule('svg-sprite-loader')
            .test(/\.svg$/)
            .include.add(resolve('src/icons')) // 处理svg目录
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                symbolId: 'icon-[name]'
            })
        config.module
            .rule('svg')
            .test(/\.(svg)(\?.*)?$/)
            .exclude.add(resolve('src/icons')) // 排除src/icons目录
            .end()
            .use('file-loader')
            .loader('file-loader')
            .options({
                name: 'images/[name].[hash:8].[ext]'
            })

        if (process.env.NODE_ENV === 'development') {
            // 项目文件大小分析
            config.plugin('webpack-bundle-analyzer').use(
                new BundleAnalyzerPlugin({
                    openAnalyzer: false, // 是否打开默认浏览器
                    analyzerPort: 8777,
                    logLevel: 'info'
                })
            )
        } else {
            config.plugin('webpack-bundle-analyzer').use(
                new BundleAnalyzerPlugin({
                    openAnalyzer: false, // 是否打开默认浏览器
                    analyzerPort: 8778,
                    logLevel: 'info'
                })
            )
        }
    }
}
