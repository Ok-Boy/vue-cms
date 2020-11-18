<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>修改商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert
                title="修改商品信息"
                type="info"
                center
                :closable='false'
                show-icon>
            </el-alert>
            <!-- 步骤条区域 -->
            <!-- activeIndex的值是一个字符串，需要将字符串转成数值，可以直接在字符串前面添加加号 -->
            <el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            
            <!-- 将添加商品分为几个步骤，所有步骤上的数据在同一个表单内 -->
            <el-form :model="goodsInfo" :rules="updataFormRules" ref="updataFormRef" label-width="100px" label-position='top'>
                <!-- 侧边tab栏区域 -->
                <!-- tab-position设置tab显示位置 -->
                <el-tabs v-model='activeIndex' :tab-position="'left'">
                    <!-- 注意：el-tab-pane只允许是el-tabs的子节点 -->
                    <el-tab-pane label="基本信息" name='0'>
                        <el-form-item label='商品名称' prop='goods_name'>
                            <el-input v-model='goodsInfo.goods_name'></el-input>
                        </el-form-item>
                        <el-form-item label='商品价格' prop='goods_price'>
                            <el-input v-model='goodsInfo.goods_price' type='number'></el-input>
                        </el-form-item>
                        <el-form-item label='商品重量' prop='goods_weight'>
                            <el-input v-model='goodsInfo.goods_weight' type='number'></el-input>
                        </el-form-item>
                        <el-form-item label='商品数量' prop='goods_number'>
                            <el-input v-model='goodsInfo.goods_number' type='number'></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name='1'>
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model='goodsInfo.goods_introduce'></quill-editor>
                        <el-button type='primary' class="updataGoodsBtn" @click="updataGood">保存修改</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 当前商品数据对象
            goodsInfo: {},
            // 步骤跳当前激活步骤，步骤跳要与tab栏互联
            activeIndex: '0',
            // 添加商品的表单的验证规则
            updataFormRules: {
                goods_name: [
                    {required: true, message: '请输入商品名称', trigger: 'blur'}
                ],
                goods_price: [
                    {required: true, message: '请输入商品价格', trigger: 'blur'}
                ],
                goods_weight: [
                    {required: true, message: '请输入商品重量', trigger: 'blur'}
                ],
                goods_number: [
                    {required: true, message: '请输入商品数量', trigger: 'blur'}
                ]
            }
        }
    },
    created(){
        // 获取当前商品id
        this.getGoodById(this.goodId)
    },
    methods: {
        // 获取所有商品分类数据
        async getGoodById(goods_id){
            const {data: res} = await this.$http.get(`goods/${goods_id}`)
            // 获取失败
            if(res.meta.status !== 200){
                return this.$message.error('获取商品数据失败')
            }
            // 获取成功
            this.$message.success('获取商品数据成功')
            this.goodsInfo = res.data
        },

        // 点击按钮，保存修改
        updataGood(){
            this.$refs.updataFormRef.validate(async (valid) => {
                // 预验证不通过
                if(!valid){
                    return this.$message.error('请填写必填项')
                }
                // 预验证通过
                const {data: res} = await this.$http.put(`goods/${this.goodId}`, this.goodsInfo)
                // 修改失败
                if(res.meta.status !== 200){
                    return this.$message.error('修改商品数据失败')
                }
                // 修改成功
                this.$message.success('修改商品数据成功')
                // 跳转回商品列表页
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        goodId(){
            return this.$route.query.id
        }
    }
}
</script>

<style lang="less" scoped>
.el-checkbox{
    margin: 0 10px 0 0 !important;
}

.previewImg{
    width: 100%;
}

.updataGoodsBtn{
    float: right;
}
</style>