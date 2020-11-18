<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type='primary' @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolelist" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for='(item1, i1) in scope.row.children' v-bind:key='item1.id'>
                            <!-- 渲染一级权限 -->
                            <el-col :span='5'>
                                <el-tag closable @close='removeRightById(scope.row, item1.id)'>{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span='19'>
                                <!-- 通过for循环嵌套渲染二级权限 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for='(item2, i2) in item1.children' v-bind:key='item2.id'>
                                    <el-col :span="6">
                                        <el-tag type='success' closable @close='removeRightById(scope.row, item2.id)'>{{ item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type='warning' v-for='item3 in item2.children' v-bind:key='item3.id' closable @close='removeRightById(scope.row, item3.id)'>
                                            {{ item3.authName }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加角色对话框 -->
        <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
        >
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 修改角色对话框 -->
        <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
        >
        <!-- 内容主体区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="editForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close='setRightDialogClose'
        >
        <!-- 树形控件 -->
        <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key='id' default-expand-all :default-checked-keys='defKeys' ref='treeRef'></el-tree>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 所有权限列表数据
      rightslist: [],
      // 树形对象的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配角色的id
      roleId: '',
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 控制编辑角色对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 查询到的角色信息对象
      editForm: {},
      // 添加表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 修改角色表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 监听添加角色对话框的关闭事件
    addDialogClosed () {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 监听编辑角色对话框的关闭事件
    editDialogClosed () {
      // 重置表单
      this.$refs.editFormRef.resetFields()
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClose () {
      this.defKeys = []
    },
    // 获取所有角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 请求成功
      this.rolelist = res.data
    },
    // 点击按钮，添加新角色
    addRole () {
      this.$refs.addFormRef.validate(async (valid) => {
        // 预验证不通过
        if (!valid) return
        // 预验证通过
        // 发送请求，添加新角色
        const { data: res } = await this.$http.post('roles', this.addForm)
        // 添加新角色失败
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 添加新角色成功
        this.$message.success(res.meta.msg)
        // 隐藏添加新角色对话框
        this.addDialogVisible = false
        // 重新获取角色列表数据
        this.getRolesList()
      })
    },
    // 点击修改角色数据并提交
    editRoleInfo () {
      this.$refs.editFormRef.validate(async (valid) => {
        // 预验证不通过
        if (!valid) return
        // 预验证通过
        // 发送请求，修改角色信息
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        // 修改角色信息失败
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // 修改角色信息成功
        this.$message.success(res.meta.msg)
        // 隐藏修改角色信息对话框
        this.editDialogVisible = false
        // 重新获取角色列表数据
        this.getRolesList()
      })
    },
    // 根据id删除角色
    async removeRoleById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 删除成功
      this.$message.success(res.meta.msg)
      // 重新获取用户列表数据
      this.getRolesList()
    },
    // 展示编辑角色的对话框
    async showEditDialog (id) {
      // 发送请求，获取当前角色信息
      const { data: res } = await this.$http.get('roles/' + id)
      // 根据id查询角色失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 根据id查询角色成功
      this.editForm = res.data
      // 显示编辑角色对话框
      this.editDialogVisible = true
    },
    // 根据id删除对应权限
    async removeRightById (role, rightId) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 删除成功
      this.$message.success(res.meta.msg)
      // 重新获取角色权限数据
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 将当前角色id保存到data中
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 请求成功，把获取到的权限数据保存到data中
      this.rightslist = res.data
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      // 显示分配权限对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 判断是否是三级节点，如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不是三级节点，则递归
      node.children.forEach((item) => {
        return this.getLeafKeys(item, arr)
      })
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        // 获取树形控件的引用
        // getCheckedKeys方法 返回目前被选中的节点的 key 所组成的数组
        ...this.$refs.treeRef.getCheckedKeys(),
        // getHalfCheckedKeys方法 返回目前半选中的节点的 key 所组成的数组
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组keys转成以逗号分割的字符串
      const ridsStr = keys.join(',')
      // 发送请求，将权限与数据库同步
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: ridsStr })
      // 分配权限失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 分配权限成功
      this.$message.success(res.meta.msg)
      // 刷新列表
      this.getRolesList()
      // 隐藏分配角色对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
    margin: 10px
}

.bdtop{
    border-top: 1px solid #eee;
}

.bdbottom{
    border-bottom: 1px solid #eee;
}

// 垂直居中对齐
.vcenter{
    display: flex;
    align-items: center;
}
</style>
