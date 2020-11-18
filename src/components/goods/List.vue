<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 搜索域添加区域 -->
            <el-row :gutter='20'>
                <el-col :span='10'>
                    <el-input placeholder="请输入内容" v-model='queryInfo.query' clearable @clear="getGoodsList" @change="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span='4'>
                    <el-button type='primary' @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 商品列表区域 -->
            <el-table :data='goodslist' border stripe>
                <!-- 索引列 -->
                <el-table-column label='#' type='index'></el-table-column>
                <el-table-column label='商品名称' prop='goods_name'></el-table-column>
                <el-table-column label='商品价格（元）' prop='goods_price' width='120px'></el-table-column>
                <el-table-column label='商品重量' prop='goods_weight' width='80px'></el-table-column>
                <el-table-column label='创建时间' width='150px'>
                    <template slot-scope="scope">
                        <!-- 使用自定义时间过滤器对时间戳进行格式处理 -->
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label='操作' width='120px'>
                    <template slot-scope="scope">
                        <!-- 编辑按钮 -->
                        <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable='false'>
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click='goUpdataPage(scope.row.goods_id)'></el-button>
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable='false'>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 5, 10, 20, 30, 50]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return {
            queryInfo: {
                // 查询参数
                query: '',
                // 当前页码
                pagenum: 1,
                // 每页显示条数
                pagesize: 10
            },
            // 商品列表
            goodslist: [],
            // 总共商品条数
            total: 0
        }
    },
    created(){
        this.getGoodsList()
    },
    methods: {
        // 获取商品列表数据
        async getGoodsList(){
            const {data: res} = await this.$http.get('goods', {
                params: this.queryInfo
            })
            // 获取数据失败
            if(res.meta.status !== 200){
                return this.$message.error('获取商品数据失败')
            }
            // 获取数据成功
            this.goodslist = res.data.goods
            this.total = res.data.total
        },
        // 监听 pagesize 改变事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 监听 页码值 改变事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        // 根据id删除商品
        async removeGoodsById(id){
            // 弹框询问用户是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch((err) => {
                return err
            })
            // 注意：如果用户点击“确认”删除，则返回值为字符串 confirm
            // 注意：如果用户点击“取消”删除，则返回值为字符串 cancel
            // 取消删除
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // 确认删除
            const { data: res } = await this.$http.delete('goods/' + id)
            // 删除失败
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败')
            }
            // 删除成功
            this.$message.success('删除商品成功')
            // 重新获取用户列表数据
            this.getGoodsList()
        },
        // 点击按钮，跳转到添加商品页面
        goAddPage(){
            this.$router.push('/goods/add')
        },
        // 点击按钮，跳转到编辑商品页面
        goUpdataPage(id){
            this.$router.push({path: `/goods/updata/`, query: { id: id }})
        }
    }
}
</script>

<style lang="less" scoped>

</style>