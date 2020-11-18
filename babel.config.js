// 这是项目发布阶段需要用到的 babel 插件
const prodPlugins = []
// 判断是否处于发布阶段
if(process.env.NODE_ENV === 'production'){
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 发布阶段时需要用到的插件数组，结构出来
    ...prodPlugins
  ]
}
