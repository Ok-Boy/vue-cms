<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 2、为ECharts准备一个具备大小（宽高）的Dom -->
            <div id="main"></div>
        </el-card>
    </div>

</template>

<script>
// 1、导入 echarts
import echarts from 'echarts'
import _ from 'lodash'
export default {
    data(){
        return{
            // 需要合并的数据
            options: {
            title: {
            text: '用户来源'
            },
            tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                backgroundColor: '#E9EEF3'
                }
            }
            },
            grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
            },
            xAxis: [
            {
                boundaryGap: false
            }
            ],
            yAxis: [
            {
                type: 'value'
            }
            ]
        }
        }
    },
    created(){},
    async mounted(){
        // 3、基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        // 4、准备数据和配置项
        const {data: res} = await this.$http.get('reports/type/1')
        // 获取失败
        if(res.meta.status !== 200){
            return this.$message.error('获取数据报表失败')
        }
        // 获取成功
        this.$message.success('获取数据报表成功')
        const result = _.merge(res.data, this.options)
        console.log('合并前：', res.data)
        console.log('合并后', result)
        // 5、使用刚指定的配置项和数据显示图表。
        myChart.setOption(result);
    },
    methods: {}
}
</script>

<style lang="less" scoped>
#main{
    width: 100%;
    height: 500px;
}
</style>