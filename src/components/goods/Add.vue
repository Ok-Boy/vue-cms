<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert
                title="添加商品信息"
                type="info"
                center
                :closable='false'
                show-icon>
            </el-alert>
            <!-- 步骤条区域 -->
            <!-- activeIndex的值是一个字符串，需要将字符串转成数值，可以直接在字符串前面添加加号 -->
            <el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            
            <!-- 将添加商品分为几个步骤，所有步骤上的数据在同一个表单内 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position='top'>
                <!-- 侧边tab栏区域 -->
                <!-- tab-position设置tab显示位置 -->
                <el-tabs v-model='activeIndex' :tab-position="'left'" :before-leave='beforeTabLeave' @tab-click='tabClicked'>
                    <!-- 注意：el-tab-pane只允许是el-tabs的子节点 -->
                    <el-tab-pane label="基本信息" name='0'>
                        <el-form-item label='商品名称' prop='goods_name'>
                            <el-input v-model='addForm.goods_name'></el-input>
                        </el-form-item>
                        <el-form-item label='商品价格' prop='goods_price'>
                            <el-input v-model='addForm.goods_price' type='number'></el-input>
                        </el-form-item>
                        <el-form-item label='商品重量' prop='goods_weight'>
                            <el-input v-model='addForm.goods_weight' type='number'></el-input>
                        </el-form-item>
                        <el-form-item label='商品数量' prop='goods_number'>
                            <el-input v-model='addForm.goods_number' type='number'></el-input>
                        </el-form-item>
                        <el-form-item label='商品分类' prop='goods_cat'>
                            <!-- 级联选择器中的v-model只能绑定数组 -->
                            <el-cascader
                            expand-trigger='hover'
                            :options="catelist"
                            :props="cateProps"
                            v-model="addForm.goods_cat"
                            @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name='1'>
                        <el-form-item :label='item.attr_name' v-for='item in manyTableData' :key='item.attr_id'>
                            <!-- 参数复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for='(cb, i) in item.attr_vals' :key='i' border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name='2'>
                        <el-form-item :label='item.attr_name' v-for='item in onlyTableData' :key='item.attr_id'>
                            <el-input v-model='item.attr_vals'></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name='3'>
                        <!-- action表示图片上传的后台API地址 -->
                        <!-- list-type文件列表的类型 -->
                        <el-upload
                        :action="uploadURL"
                        :headers="headerObj"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :on-success="handleSuccess"
                        list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <!-- 文本提示 -->
                        <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name='4'>
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model='addForm.goods_introduce'></quill-editor>
                        <el-button type='primary' class="addGoodsBtn" @click='addGood'>添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog
            :title="previewName"
            :visible.sync="previewDialogVisible"
            width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
// 引入 lodash ，官方推荐使用下划线命名
import _ from 'lodash'
export default {
    data(){
        return {
            // 步骤跳当前激活步骤，步骤跳要与tab栏互联
            activeIndex: '0',
            // 添加商品的表单数据对象
            addForm: {
                // 商品名称
                goods_name: '',
                // 商品价格
                goods_price: 0,
                // 商品重量
                goods_weight: 0,
                // 商品数量
                goods_number: 0,
                // 商品所属的分类数组
                goods_cat: [],
                // 上传成功的图片数组
                pics: [],
                // 商品介绍
                goods_introduce: '',
                // 商品的参数，动态参数和静态属性
                attrs: []
            },
            // 添加商品的表单的验证规则
            addFormRules: {
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
                ],
                goods_cat: [
                    {required: true, message: '请选择商品分类', trigger: 'blur'}
                ]
            },
            // 商品分类列表
            catelist: [],
            // 商品分类级联选择器配置对象
            cateProps: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // 动态参数列表数据
            manyTableData: [],
            // 静态属性列表数据
            onlyTableData: [],
            // 图片上传后台API接口地址
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传的header请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 预览图片路径
            previewPath: '',
            // 预览图片名称
            previewName: '',
            // 控制图片预览对话框的显示与隐藏
            previewDialogVisible: false
        }
    },
    created(){
        this.getCateList()
    },
    methods: {
        // 获取所有商品分类数据
        async getCateList(){
            const {data: res} = await this.$http.get('categories')
            // 获取失败
            if(res.meta.status !== 200){
                return this.$message.error('获取商品分类失败')
            }
            // 获取成功
            this.catelist = res.data
        },
        // 商品分类级联选择器选中项发生变化，触发该函数
        handleChange(){
            console.log(this.addForm.goods_cat)
            // 控制级联选择器只能选择三级分类
            if(this.addForm.goods_cat.length !== 3){
                this.addForm.goods_cat = []
            }
        },
        // 切换标签页之前触发该钩子函数，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
        // 参数一表示即将进入的标签页名称，参数二表示当前的标签页名称
        // 在该函数中阻止标签页的切换
        beforeTabLeave(activeName, oldActiveName){
            // console.log(activeName, oldActiveName)
            // console.log(this.addForm.goods_cat.length)
            // 如果当前标签页为'基础信息',标签页的名称为'0'，并且该标签页中的级联选择器为空时，阻止进入后面其他标签页
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
                this.$message.error('请先选择商品分类')
                return false
            }
        },
        // 当tab被选中时触发该事件，所以可在该函数被触发时获取数据
        async tabClicked(){
            // console.log(this.activeIndex)
            // 访问的是商品（动态）参数面板
            if(this.activeIndex === '1'){
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: 'many'
                    }})
                // 获取失败
                if(res.meta.status !== 200){
                    return this.$message.error('获取商品参数失败')
                }
                // 获取成功
                // console.log(res.data)
                // this.$message.success('获取商品参数成功')
                // 对获取到的数据里面的attr_vals由字符串处理成数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                })
                this.manyTableData = res.data
                // console.log(this.manyTableData)
            } else if(this.activeIndex === '2'){
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: 'only'
                    }})
                // 获取失败
                if(res.meta.status !== 200){
                    return this.$message.error('获取商品属性失败')
                }
                // 获取成功
                // this.$message.success('获取商品属性成功')
                this.onlyTableData = res.data
            }
        },
        // 处理图片预览操作
        handlePreview(file){
            // console.log(file)
            // 获取预览图片路径和名称
            this.previewPath = file.response.data.url
            this.previewName = file.name
            // 显示预览图片对话框
            this.previewDialogVisible = true
        },
        // 处理图片移除操作
        handleRemove(file){
            // console.log(file)
            // 1、获取将要删除的图片的临时路径
            const filePath = file.response.data.tmp_path
            // 2、从pics数组中，找到这个图片对应的索引值
            const idx = this.addForm.pics.findIndex(item => {
                return item.pic = filePath
            })
            // 3、调用数组的splice方法。把图片信息对象从pics数组中移除
            this.addForm.pics.splice(idx, 1)
            // console.log(this.addForm.pics)
        },
        // 监听图片上传成功的事件
        handleSuccess(response){
            // console.log(response)
            // 1、拼接得到一个图片信息对象
            const picInfo = {pic: response.data.tmp_path}
            // 2、将图片信息对象push到pics数组中
            this.addForm.pics.push(picInfo)
            // console.log(this.addForm.pics)
        },
        // 点击按钮，添加商品
        addGood(){
            this.$refs.addFormRef.validate(async (valid) => {
                // 预验证不通过
                if(!valid){
                    return this.$message.error('请填写必填项')
                }
                // 预验证通过
                // 添加商品时，要求参数goods_cat必须是一个字符串，但级联选择器绑定的只能是一个数组
                // 如果使用join将数组转成以逗号分隔的字符串，会导致冲突，所以需要对addForm对象进行深拷贝，在对对象内的goods_cat数组进行转换成以逗号分隔的字符串
                // 错误示范：
                // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
                // 正确方案：使用第三方库 lodash 中的 cloneDeep 进行深拷贝
                const new_addForm = _.cloneDeep(this.addForm)
                new_addForm.goods_cat = new_addForm.goods_cat.join(',')

                // 处理动态属性，将manyTableData数组追加至attr数组，并且参数goods_vals是一个以空格分隔的字符串
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                    }
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态参数
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.addForm.attrs.push(newInfo)
                })
                new_addForm.attrs = this.addForm.attrs
                // console.log('addForm', this.addForm)
                // console.log('new_addForm', new_addForm)
                console.log('manyTableData', this.manyTableData)
                console.log('onlyTableData', this.onlyTableData)

                // 发送请求，添加商品
                // 注意：商品名称是唯一的
                const {data: res} = await this.$http.post('goods', new_addForm)
                // 添加失败
                if(res.meta.status !== 201){
                    return this.$message.error(res.meta.msg)
                }
                // 添加成功
                this.$message.success(res.meta.msg)
                // 跳转回商品列表页
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        // 商品分类id
        cateId() {
            if(this.addForm.goods_cat.length === 3){
                return this.addForm.goods_cat[2]
            }
            return null
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

.addGoodsBtn{
    float: right;
}
</style>