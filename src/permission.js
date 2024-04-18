import router from './router'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式

NProgress.configure({
    easing: 'ease', // 动画方式，和css动画属性一样（默认：ease）
    speed: 500, // 递增进度条的速度，单位ms（默认：200）
    showSpinner: false, // 是否显示加载ico
    trickle: true, //是否自动递增
    trickleSpeed: 100, // 自动递增间隔
    minimum: 0.3, // 初始化时的最小百分比，0-1（默认：0.08）
    parent: 'body' //指定此选项以更改父容器（默认：body）
})
router.beforeEach(async (to, from, next) => {
    NProgress.start()
    next()
})
router.afterEach(() => {
    NProgress.done() // 结束Progress
})

router.onError(() => {
    console.warn('路由错误')
})
