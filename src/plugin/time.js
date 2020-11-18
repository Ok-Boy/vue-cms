// 自定义日期过滤器
import Vue from 'vue'
Vue.filter('dateFormat', function(originVal){
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    // padStart()和padEnd()是ES6新增的方法，用于对字符串长度进行补全
    // 参数一表示字符串指定的长度
    // 参数二表示使用什么补全
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})