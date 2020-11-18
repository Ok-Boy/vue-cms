<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 头部警告区域 -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                show-icon
                :closable='false'>
            </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader
                    expand-trigger='hover'
                    v-model="selectedCateKeys"
                    :options="catelist"
                    :props="cateProps"
                    @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- tabs标签页区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type='primary' size='mini' :disabled='isBtnDisabled' @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data='manyTableData' border stripe>
                        <!-- 展开行 -->
                        <el-table-column type='expand'>
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for='(item, i) in scope.row.attr_vals' :key='i' closable @close='handleClosse(i, scope.row)'>{{ item }}</el-tag>
                                <!-- 输入文本框 -->
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type='index' label='#'></el-table-column>
                        <el-table-column label='参数名称' prop='attr_name'></el-table-column>
                        <el-table-column label='操作'>
                            <template slot-scope="scope">
                                <el-button type='primary' icon='el-icon-edit' size='mini' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type='danger' icon='el-icon-delete' size='mini' @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type='primary' size='mini' :disabled='isBtnDisabled' @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data='onlyTableData' border stripe>
                        <!-- 展开行 -->
                        <el-table-column type='expand'>
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for='(item, i) in scope.row.attr_vals' :key='i' closable @close='handleClosse(i, scope.row)'>{{ item }}</el-tag>
                                <!-- 输入文本框 -->
                                <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type='index' label='#'></el-table-column>
                        <el-table-column label='属性名称' prop='attr_name'></el-table-column>
                        <el-table-column label='操作'>
                            <template slot-scope="scope">
                                <el-button type='primary' icon='el-icon-edit' size='mini' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type='danger' icon='el-icon-delete' size='mini' @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数对话框 -->
        <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
        >
        <!-- 添加参数的表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>    
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 编辑对话框 -->
        <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
        >
        <!-- 添加参数的表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>    
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 商品分类列表数据
            catelist: [],
            // 级联选择器的配置对象
            cateProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 级联选择框双向绑定数组
            selectedCateKeys: [],
            // 被激活的标签页名称
            activeName: 'many',
            // 动态参数数据
            manyTableData: [],
            // 静态属性数据
            onlyTableData: [],
            // 控制添加对话框的显示与隐藏
            addDialogVisible: false,
            // 控制编辑对话框的显示与隐藏
            editDialogVisible: false,
            // 添加参数表单的数据对象
            addForm: {},
            // 添加参数表单的验证规则对象
            addFormRules: {
                attr_name: [
                    {required: true, message: '请输入参数名称', trigger: 'blur'}
                ]
            },
            // 编辑参数表单的数据对象
            editForm: {},
            // 编辑参数表单的验证规则对象
            editFormRules: {
                attr_name: [
                    {required: true, message: '请输入参数名称', trigger: 'blur'}
                ]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取所有的商品分类列表
        async getCateList(){
            const {data: res} = await this.$http.get('categories')
            // 获取失败
            if(res.meta.status !== 200){
                return this.$message.error('获取商品分类失败')
            }
            // 获取成功
            this.catelist = res.data
            // console.log(this.catelist)
        },
        // 级联选择框变化时触发该函数
        handleChange(){
            this.getParamsData()
        },
        // tabs标签页点击事件的处理函数
        handleTabClick(){
            this.getParamsData()
        },
        // 获取参数列表数据
        async getParamsData(){
            // 未选中三级分类
            if(this.selectedCateKeys.length !== 3){
                // 将级联选择器清空
                return this.selectedCateKeys = []
                // 将动态参数清空
                manyTableData = []
                // 将静态属性清空
                onlyTableData = []
            }
            // 选中三级分类
            // console.log(this.selectedCateKeys)
            // 根据所选分类id和当前所处的面板，获取对应的参数
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {
                sel: this.activeName
            }})
            // 获取失败
            if(res.meta.status !== 200){
                return this.$message.error('获取参数列表失败')
            }
            // 获取成功
            // console.log(res.data)
            // 获取参数可选项
            res.data.forEach(item => {
                // 获取到的可选项是一个字符串，以空格分割，将字符串转成数组
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                // 控制文本框的显示与隐藏
                item.inputVisible = false
                // 文本框中输入的值
                item.inputValue = ''
            })
            // console.log(res.data)

            if(this.activeName === 'many'){
                this.manyTableData = res.data
            }else{
                this.onlyTableData = res.data
            }
        },
        // 监听添加参数对话框的关闭事件
        addDialogClosed(){
            // 重置表单
            this.$refs.addFormRef.resetFields()
        },
        // 监听编辑参数对话框的关闭事件
        editDialogClosed(){
            // 重置表单
            this.$refs.editFormRef.resetFields()
        },
        // 点击按钮，添加参数
        addParams(){
            this.$refs.addFormRef.validate(async (valid) => {
                // 预验证不通过
                if(!valid) return
                // 预验证通过
                const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                // 添加失败
                if(res.meta.status !== 201){
                    return this.$message.error('添加参数失败')
                }
                // 添加成功
                this.$message.success('添加参数成功')
                // 隐藏添加参数对话框
                this.addDialogVisible = false
                // 重新获取参数列表数据
                this.getParamsData()
            })
        },
        // 点击按钮，展示编辑对话框
        async showEditDialog(attr_id){
            // 查询当前参数信息
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {params: {attr_sel: this.activeName}})
            // 获取失败
            if(res.meta.status !== 200){
                return this.$message.error('获取参数信息失败')
            }
            // 获取成功
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 点击按钮，编辑参数信息
        editParams() {
            this.$refs.editFormRef.validate(async (valid) => {
                // 预验证不通过
                if(!valid) return
                // 预验证通过
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                // 修改成功
                if(res.meta.status !== 200){
                    return this.$message.error('修改参数失败')
                }
                // 修改成功
                this.$message.success('修改参数成功')
                // 重新获取参数列表数据
                this.getParamsData()
                // 隐藏编辑表单对话框
                this.editDialogVisible = false
                
            })
        },
        // 根据id删除参数
        async removeParams(attr_id){
            // 弹框询问用户是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch((err) => {
                return err
            })
            // 注意：如果点击“确认”删除，则返回值为字符串 confirm
            // 注意：如果点击“取消”删除，则返回值为字符串 cancel
            // 取消删除
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // 确认删除
            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
            // 删除失败
            if (res.meta.status !== 200) {
                return this.$message.error(res.meta.msg)
            }
            // 删除成功
            this.$message.success(res.meta.msg)
            // 重新获取用户列表数据
            this.getParamsData()
        },
        // 文本框失去焦点或按下回车键触发该函数
        async handleInputConfirm(row){
            // 判断用户是否在文本框中输入了合法内容
            if(row.inputValue.trim().length === 0){
                // 如果去掉两端的空格之后的长度为0，表示没有输入有意义的内容，则直接清空文本框
                row.inputValue = ''
                // 将文本框隐藏，显示按钮
                row.inputVisible = false
                return
            }
            // 如果没有return，表示文本框中输入了内容，需要做后续处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 发送请求，保存操作，同步数据
            this.saveAttrVals(row)
        },
        // 点击按钮，展示文本输入框
        showInput(row){
            row.inputVisible = true
            // 让文本框自动获得焦点
            // $nextTick 当页面上元素被重新渲染之后，才会指定回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 删除对应参数的的选项
        handleClosse(i, row){
            row.attr_vals.splice(i, 1)
            this.saveAttrVals(row)
        },
        // 将对attr_vals的操作保存到数据库
        async saveAttrVals(row){
            // 发送请求，保存操作，同步数据
            const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' ')
            })
            // 修改参数项失败
            if(res.meta.status !== 200){
                return this.$message.error('修改失败')
            }
            // 修改参数项成功
            this.$message.success('修改成功')
        }

    },
    computed: {
        // 如果按钮需要被禁用，则返回true，否则返回false
        isBtnDisabled(){
            if(this.selectedCateKeys.length !== 3){
                return true
            }
            return false
        },
        // 当前选中的三级分类的id
        cateId(){
            if(this.selectedCateKeys.length === 3){
                return this.selectedCateKeys[2]
            }
            return null
        },
        // 动态计算标题的文本
        titleText(){
            if(this.activeName === 'many'){
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>

<style lang="less" scoped>
.cat_opt{
    margin: 15px 0;
}

.el-tag{
    margin: 10px;
}

.input-new-tag{
    width: 120px;
}
</style>