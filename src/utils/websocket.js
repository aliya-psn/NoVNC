/*
 * socket封装
 * 方法：connect、close、send
 */
import { DEVICE_PORT } from '@/utils/constants'

export default function WebsocketClient() {}

WebsocketClient.prototype._generateEndpoint = function () {
    var protocol = ''
    if (window.location.protocol === 'https:') {
        protocol = 'wss://'
    } else {
        protocol = 'ws://'
    }
    var endpoint =
        protocol +
        sessionStorage.getItem('deviceIp') +
        `:${DEVICE_PORT}/wsdemo?username=` +
        localStorage.getItem('nickname')
    console.log('websocket地址:', endpoint)
    return endpoint
}

WebsocketClient.prototype.connect = function (options) {
    var endpoint = this._generateEndpoint()
    if (window.WebSocket) {
        this._connection = new WebSocket(endpoint)
        // 设置为二进制消息
        // this._connection.binaryType = 'arraybuffer'
    } else {
        options.onError('WebSocket Not Supported')
        return
    }

    this._connection.onopen = function () {
        options.onConnect()
    }

    this._connection.onmessage = function (evt) {
        var data = evt.data
        options.onData(data)
    }

    this._connection.onclose = function (e) {
        console.log('websocket断开连接：', e.code + ' ' + e.reason + ' ' + e.wasClean)
        options.onClose()
    }
}

WebsocketClient.prototype.close = function () {
    console.log('断开socket连接')
    this._connection.close()
}

WebsocketClient.prototype.send = function (data) {
    console.log('send')

    this._connection.send(data)
}

WebsocketClient.prototype.sendInitData = function (options) {
    // 连接参数
    this._connection.send(JSON.stringify(options))
}

WebsocketClient.prototype.sendClientData = function (data) {
    // 发送指令
    this._connection.send(JSON.stringify(data))
}
