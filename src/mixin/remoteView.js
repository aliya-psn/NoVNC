import RFB from '@novnc/novnc/core/rfb'
import WebsocketClient from '@/utils/websocket'
import { VNC_PASSWORD, VNC_PORT } from '@/utils/constants'
import iconv from 'iconv-lite'

var socketClient = null

export default {
    data() {
        return {
            isDisconnect: false // 是否手动断开远程连接和socket
        }
    },
    beforeDestroy() {
        // 断开连接
        this.handleDisConnected()
    },
    methods: {
        // 获取当前时间
        getCurrentTime() {
            let yy = new Date().getFullYear()
            let mm = new Date().getMonth() + 1
            let dd = new Date().getDate()
            let hh = new Date().getHours()
            let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
            let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds()
            return yy + '/' + mm + '/' + dd + ' ' + hh + ':' + mf + ':' + ss
        },
        // 连接vnc
        connectVnc() {
            if (this.rfb) {
                return
            }
            this.setStatus('<strong style="color: #409EFF;">连接中...</strong>')

            let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
            const param = `username=${localStorage.getItem('nickname')}`
            let wsHost = window.location.host
            this.wsURL = `${protocol}${wsHost}/vnc/${this.selectedDeviceInfo.deviceIp}:${VNC_PORT}?${param}`

            this.rfb = new RFB(document.getElementById('screen_remote'), this.wsURL, {
                credentials: { password: VNC_PASSWORD }
            })
            this.rfb.addEventListener('connect', this.connectedToServer)
            this.rfb.addEventListener('disconnect', this.disconnectedFromServer)
            this.rfb.addEventListener('clipboard', this.handelClipboard)

            // scaleViewport指示是否应在本地扩展远程会话以使其适合其容器。禁用时，如果远程会话小于其容器，则它将居中，或者根据clipViewport它是否更大来处理。默认情况下禁用。
            this.rfb.scaleViewport = true
            //是一个boolean指示是否每当容器改变尺寸应被发送到调整远程会话的请求。默认情况下禁用
            this.rfb.resizeSession = false
            // this.rfb.background = 'rgb(208, 206, 206)'
            // this.rfb.focusOnClick = true // 指示在收到mousedown或touchstart事件时是否应自动将键盘焦点移动到远程会话
            // this.rfb.dragViewport = true // 指示鼠标事件是否应控制剪切的远程会话的相对位置
            // this.rfb.clipViewport = true  // 指示是否应将远程会话剪切到其容器。禁用时，将显示滚动条以处理产生的溢出
            // this.rfb.viewOnly = false // 指示是否应该阻止将任何事件（例如按键或鼠标移动）发送到服务器
            this.rfb.showDotCursor = true // 指示如果服务器设置了此类不可见光标，是否应显示点光标而不是零大小或完全透明的光标。默认禁用
            // 监听本地的复制事件
            document.addEventListener('copy', async event => {
                try {
                    const clipboardText = await navigator.clipboard.readText()
                    // 在 noVNC 中使用 clipboardPasteFrom 将文本发送到远程桌面
                    this.rfb && this.rfb.clipboardPasteFrom(clipboardText)
                    event.preventDefault()
                } catch (error) {
                    console.error('Error reading clipboard:', error)
                }
            })
        },
        // 定义一个函数用于将 ISO-8859-1 编码字符串转为 GBK 编码字符串
        iso8859ToGbk(iso8859String) {
            // 将 ISO-8859-1 编码的字符串转为 UTF-8 编码的 Buffer
            const utf8Buffer = Buffer.from(iso8859String, 'binary')
            // 使用 iconv 将 UTF-8 转为 GBK
            const gbkBuffer = iconv.decode(utf8Buffer, 'GBK')
            return gbkBuffer.toString('GBK')
        },
        // 剪切板数据接收
        handelClipboard(e) {
            console.log('剪切板数据接收：', e)
            try {
                let msg = e.detail.text
                if (msg.includes('?')) {
                    return
                }
                const encoder = this.iso8859ToGbk(msg)
                console.log('转码：', encoder)

                let input = document.createElement('input')
                input.value = encoder
                document.body.appendChild(input)
                input.select()
                document.execCommand('copy')
                document.body.removeChild(input)
            } catch (error) {
                console.error('An error occurred while decoding the clipboard:', error)
            }
        },

        // 断开远程
        disconnectRemote() {
            this.handleDisConnected()
            if (!this.selectedDeviceInfo) {
                this.$notify.error({
                    title: '提示',
                    message: '请连接设备后进行操作'
                })
                return
            }
        },

        // 设置连接远程状态值
        setStatus(text) {
            this.navStatus = text
        },

        /**
         * 更新顶部提示信息
         */
        updateNavTipIsSocket() {
            const noEditTip = '&nbsp;&nbsp;<strong style="color: #409EFF;">socket数据更新</strong>'
            this.setStatus(this.getCurrentTime() + noEditTip)
        },

        // 连接远程socket
        connectSocket() {
            socketClient = new WebsocketClient()
            let timer = null

            socketClient.connect({
                onError: () => {
                    console.log('连接websocket失败')
                    this.cacheSocketConnectCount++
                    if (this.cacheSocketConnectCount < 3) {
                        console.log('连接socket失败，进行重连第' + this.cacheSocketConnectCount + '次')
                        this.connectSocket()
                    } else {
                        this.$message.error('连接socket失败，请检查网络！')
                    }
                },
                onConnect: () => {
                    console.log('连接websocket成功\r\n')

                    // 设置定时器，在5秒内如果没有接收到数据，则重新连接
                    if (timer) {
                        clearInterval(timer)
                        timer = null
                    }
                    timer = setInterval(() => {
                        console.log('10秒内未接收到数据，重新连接')
                        // 关闭之前的连接
                        socketClient && socketClient.close()
                        socketClient = null
                        // 重新连接
                        this.connectSocket()
                    }, 10000)
                },
                onClose: () => {
                    console.log('连接关闭')
                    clearInterval(timer)
                    timer = null
                },
                onData: res => {
                    // 清除定时器，重置记时
                    clearInterval(timer)

                    this.updateNavTipIsSocket()
                    // 收到数据时回调
                    try {
                        if (typeof res === 'string' && res.indexOf('data') > 0) {
                            res = JSON.parse(res)
                            if (res && Number(res.code) === 200) {
                                console.log(res.data)
                            } else {
                                this.$message.error('连接失败')
                                this.handleDisConnected()
                            }
                        }
                    } catch (error) {
                        console.error('JSON 解析异常:', error.message)
                    }
                }
            })
        },

        // 发送socket消息，获取截屏
        sendSocketMessage(message) {
            if (!socketClient) {
                this.$message.error('请先连接远程桌面')
                return
            }
            console.log('发送socket消息：' + message)
            socketClient.send(message)
        },
        async connectedToServer() {
            this.setStatus(this.getCurrentTime() + ' 成功连接到远程桌面')
            console.log('连接VNC成功')
            this.rfb.focus()
            this.reConnectCount = 0 // 重连次数置空

            this.isDisconnect = false // 默认是异常断开
        },

        disconnectedFromServer(e) {
            // 根据 断开信息的msg.detail.clean 来判断是否可以重新连接
            if (e.detail.clean) {
                this.setStatus('断开连接')
                console.log('clean', e.detail.clean)

                // 如果是异常断开，重连
                if (!this.isDisconnect) {
                    this.rfb = null
                    this.connectVnc()
                } else {
                    this.selectedDeviceInfo = null
                    this.isDisconnect = true
                    socketClient && socketClient.close()
                    socketClient = null
                }
            } else {
                this.reConnectCount++
                if (this.reConnectCount < 3) {
                    console.log('连接vnc失败，进行重连第' + this.reConnectCount + '次')
                    this.connectVnc()
                } else {
                    this.setStatus('发生错误，连接关闭， 目标地址：' + this.wsURL)
                    this.$message.error('连接失败，请检查网络！')
                    this.selectedDeviceInfo = null
                }
            }
        },
        // 断开连接处理
        handleDisConnected() {
            this.isDisconnect = true
            this.rfb && this.rfb._disconnect()
            this.rfb = null
            socketClient && socketClient.close()
            socketClient = null
        }
    }
}
