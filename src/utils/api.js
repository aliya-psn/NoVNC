/*
 * api请求封装
 */
import axios from 'axios'
import { Message } from 'element-ui'

// 创建axios实例
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: 200000 // 请求超时时间
})
// request拦截器
service.interceptors.request.use(
    config => {
        let token = 'Token'
        if (token) {
            config.headers.token = token
        }
        return config
    },
    error => {
        // Do something with request error
        console.error(error) // for debug
        Promise.reject(error)
    }
)
// respone拦截器
service.interceptors.response.use(
    response => {
        const res = response.data
        if (parseInt(res.code) === 200) {
            return res
        } else if (res.code === '20011') {
            Message({
                message: '登录已过期，重新登录',
                type: 'error',
                duration: 3 * 1000
            })
            if (res.info && typeof res.info === 'string') {
                // res.info: sso认证重定向地址
                location.href = res.info
                return Promise.reject('未登录')
            }
        } else {
            Message({
                message: res.msg,
                type: 'error',
                duration: 3 * 1000
            })
            return res
        }
    },
    error => {
        console.error('请求失败：' + error) // for debug
        Message({
            message: error.message,
            type: 'error',
            duration: 3 * 1000
        })
        return Promise.reject(error)
    }
)
export default service
