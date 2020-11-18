<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-input placeholder="请输入内容" clearable>
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 订单列表数据 -->
            <el-table :data='orderlist' border stripe>
                <!-- 展开行 -->
                <el-table-column type='expand'>
                    <template slot-scope="scope">
                        <el-form label-position="left" inline class="table-expand" label-width='100px'>
                            <el-form-item label="用户ID">
                                <span>{{ scope.row.user_id }}</span>
                            </el-form-item>
                            <el-form-item label="订单ID">
                                <span>{{ scope.row.order_id }}</span>
                            </el-form-item>
                            <el-form-item label="订单编号">
                                <span>{{ scope.row.order_number }}</span>
                            </el-form-item>
                            <el-form-item label="订单价格">
                                <span>{{ scope.row.order_price }}</span>
                            </el-form-item>
                            <el-form-item label="是否付款">
                                <span v-if="scope.row.pay_status === '1'">已付款</span>
                                <span v-else>未付款</span>
                            </el-form-item>
                            <el-form-item label="付款方式">
                                <span v-if="scope.row.order_pay === '1'">支付宝</span>
                                <span v-else-if="scope.row.order_pay === '2'">微信</span>
                                <span v-else-if="scope.row.order_pay === '3'">银行卡</span>
                                <span v-else>未付款</span>
                            </el-form-item>
                            <el-form-item label="是否发货">
                                <span>{{ scope.row.is_send }}</span>
                            </el-form-item>
                            <el-form-item label="下单时间">
                                <span>{{ scope.row.create_time | dateFormat}}</span>
                            </el-form-item>
                            <!-- <el-form-item label="收货地址">
                                <span>{{ scope.row.consignee_addr }}</span>
                            </el-form-item> -->
                            <el-form-item label="发票类型">
                                <span>{{ scope.row.order_fapiao_title }}</span>
                            </el-form-item>
                            <el-form-item label="发票抬头">
                                <span>{{ scope.row.order_fapiao_company }}</span>
                            </el-form-item>
                            <el-form-item label="发票内容">
                                <span>{{ scope.row.order_fapiao_content }}</span>
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column label='#' type='index'></el-table-column>
                <el-table-column label='订单编号' prop='order_number'></el-table-column>
                <el-table-column label='订单价格' prop='order_price'></el-table-column>
                <el-table-column label='是否付款' prop='pay_status'>
                    <template slot-scope="scope">
                        <el-tag type='success' v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type='danger' v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label='是否发货' prop='is_send'></el-table-column>
                <el-table-column label='下单时间' width='150px'>
                    <template slot-scope="scope">
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label='操作' width='120px'>
                    <template slot-scope="">
                        <el-tooltip class="item" effect="dark" content="订单地址" placement="top" :enterable='false'>
                            <el-button type='primary' icon='el-icon-edit' size='mini' @click="showBox"></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="物流进度" placement="top" :enterable='false'>
                            <el-button type='success' icon='el-icon-location' size='mini'></el-button>
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

        <!-- 修改地址对话框 -->
        <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        width="50%"
        @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" class="demo-ruleForm">
            <el-form-item label="省市区/县" prop="address1">
                <!-- 省市区县级联选择框 -->
                <el-cascader :options='cityData' v-model='addressForm.address1'></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
        </span>
        </el-dialog>

    </div>
</template>

<script>
// 导入省市区县地址数据文件
import cityData from './citydata.js'
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
            // 总订单条数
            total: 0,
            // 订单数据数组
            orderlist: [],
            // 控制修改地址对话框的显示与隐藏
            addressDialogVisible: false,
            // 订单地址表单数据
            addressForm: {
                address1: '',
                address2: ''
            },
            // 订单地址表单校验规则
            addressFormRules: {
                address1: [
                    { required: true, message: '请选择省市区/县', trigger: 'blur' },
                ],
                address2: [
                    { required: true, message: '请填写详细地址', trigger: 'blur' },
                ]
            },
            // 省市区县地址数据
            cityData
        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        // 获取订单列表数据
        async getOrderList(){
            const {data: res} = await this.$http.get('orders', { params: this.queryInfo })
            // 获取失败
            if(res.meta.status !== 200){
                return this.$message.error('获取订单数据失败')
            }
            // 获取成功
            console.log('订单信息', res)
            this.$message.success('获取订单数据成功')
            this.total = res.data.total
            this.orderlist = res.data.goods
        },
        // 监听 pagesize 改变事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        // 监听 页码值 改变事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        // 展示修改地址对话框
        showBox(){
            this.addressDialogVisible = true
        },
        // 监听订单地址对话框的关闭事件
        addressDialogClosed () {
        // 重置表单
        this.$refs.addressFormRef.resetFields()
        },
    }
}
</script>

<style lang="less" scoped>
.el-cascader{
    width: 100%;
}

.table-expand {
    font-size: 14px;
    .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 100%;
        color: brown;
    }

}
</style>