<!-- eslint-disable vue/no-v-html -->
<template>
    <div class="page-home">
        <div id="top_bar">
            <div class="nav-title">远程桌面</div>
            <div class="nav-status" v-html="navStatus"></div>
            <div class="operation">
                <div class="operation_btn" @click="connectRemoteDevice">连接远程</div>
                <div class="operation_btn" @click="disconnectRemote">断开远程</div>
            </div>
        </div>
        <div class="content-area">
            <!-- 远程桌面 -->
            <div
                id="screen_remote"
                class="remote-view"
                :style="[{ width: `${remoteScreenCoor.width}px` }, { height: `${remoteScreenCoor.height}px` }]"
                element-loading-text="加载设备中..."></div>
        </div>
    </div>
</template>

<script>
import remoteView from '@/mixin/remoteView'
import { VNC_DEVICE_IP } from '@/utils/constants'

export default {
    name: 'Home',
    mixins: [remoteView],
    data() {
        return {
            selectedDeviceInfo: null, // 选择的设备信息

            // 失败重连次数
            cacheSocketConnectCount: 0,
            navStatus: null,
            rfb: null,
            reConnectCount: 0, // 失败重连次数
            remoteScreenCoor: {
                width: 0,
                height: 0
            } // 远程屏幕的宽高
        }
    },
    methods: {
        // 连接设备
        connectRemoteDevice() {
            this.selectedDeviceInfo = {
                deviceIp: VNC_DEVICE_IP
            }
            // socket连接ip
            sessionStorage.setItem('deviceIp', this.selectedDeviceInfo.deviceIp) 
            // 设置远程屏幕的宽高
            this.remoteScreenCoor = {
                width: 1920 / 1.7,
                height: 1080 / 1.7
            }
            // 连接vnc
            this.connectVnc()
            // 连接socket
            this.connectSocket()
        }
    }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$top_bar_height: 34px;

.page-home {
    background-color: rgb(240, 240, 240);
    color: rgb(70, 70, 70);
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    font-size: 12px;

    #top_bar {
        background-color: white;
        font: bold 12px Helvetica;
        border-bottom: 1px outset rgb(236, 235, 235, 0.3);
        box-sizing: border-box;
        height: $top_bar_height;
        line-height: $top_bar_height;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .nav-title {
            padding-left: 20px;
        }

        .nav-status {
            text-align: center;
        }

        .operation {
            margin-right: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            .operation_btn {
                cursor: pointer;
            }
        }
    }

    .content-area {
        border: 1px solid rgb(222, 220, 220);
    }
}
</style>
