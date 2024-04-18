/*
 * node服务  处理WebSockets和TCP包之间的转换
 */
const http = require('http')
const net = require('net')
const WebSocketServer = require('ws').Server
const log4js = require('log4js')
log4js.configure(require('./log4js.json'))

const logger = log4js.getLogger()

/** 本机 ip 地址 */
const localhost = '127.0.0.1'

/** 开放的 vnc websocket 转发端口 */
const vncPort = '8112'

/** 打印提示信息 */
logger.info(`成功创建 WebSocket 代理 : ${localhost} : ${vncPort}`)

/** 建立基于 vncPort 的 websocket 服务器 */
const vncServer = http.createServer()
vncServer.listen(vncPort, function () {
    const webSocketServer = new WebSocketServer({ server: vncServer })
    webSocketServer.on('connection', webSocketHandler)
})

/** websocket 处理器 */
const webSocketHandler = function (client, req) {
    /** 获取请求url */
    const url = req.url

    /** 截取主机地址 */
    const host = url.substring(url.indexOf('/') + 1, url.indexOf(':'))

    /** 截取端口号 */
    const port = Number(url.substring(url.indexOf(':') + 1, url.indexOf('?')))

    const urlParse = require('url')
    // 使用url.parse解析URL
    const parsedUrl = urlParse.parse(url, true)

    const deviceId = parsedUrl.query.deviceId
    const username = parsedUrl.query.username

    logger.info(`WebSocket连接 : 主机 ${host}, 端口 ${port}`)
    /** 连接到 VNC Server */
    const target = net.createConnection(port, host, function () {
        logger.info('有设备连接至主机', `设备参数 —— id: ${deviceId}, 更新人: ${username}`)
    })

    /** 数据事件 */
    target.on('data', function (data) {
        try {
            client.send(data)
        } catch (error) {
            logger.info('客户端已关闭，清理到目标主机的连接')
            target.end()
        }
    })

    /** 结束事件 */
    target.on('end', function () {
        logger.info('目标主机已关闭')
        client.close()
    })

    /** 错误事件 */
    target.on('error', function () {
        logger.error('目标主机连接错误')
        target.end()
        client.close()
    })

    /** 消息事件 */
    client.on('message', function (msg) {
        target.write(msg)
    })

    /** 关闭事件 */
    client.on('close', function (code, reason) {
        logger.info(`WebSocket 客户端断开连接：${code} [${reason}]`)
        target.end()
    })

    /** 错误事件 */
    client.on('error', function (error) {
        logger.error(`WebSocket 客户端出错：${error}`)
        target.end()
    })
}