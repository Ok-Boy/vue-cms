<template>
  <div>
    <!-- 布局容器 -->
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <span>电商后台管理系统</span>
        <el-dropdown split-button type="info">
        {{ currentUser }}
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native='logout'>退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      </el-header>
      <!-- 主题区域 -->
      <el-container>
        <!-- 左侧边栏 -->
        <el-aside v-bind:width="isCollapse ? '64px' : '200px'">
            <!-- 菜单折叠与展开区域 -->
            <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            v-bind:unique-opened='true'
            v-bind:collapse='isCollapse'
            v-bind:collapse-transition='false'
            v-bind:router='true'
            v-bind:default-active='activePath'
          >
            <!-- 一级菜单 -->
            <el-submenu v-bind:index="item.id + ' '" v-for="item in menulist" v-bind:key="item.id">
              <!-- 一级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i v-bind:class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item v-bind:index="'/' + subItem.path" v-for="subItem in item.children" v-bind:key="subItem.id" @click="saveNavState('/' + subItem.path)">
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧主体 -->
        <el-main>
            <!-- 路由占位符 -->
            <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      // 一级菜单图标对象
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: '',
      // 当前登录用户
      currentUser: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
    this.currentUser = window.sessionStorage.getItem('currentUser')
  },
  methods: {
    // 退出登录
    logout() {
      // 清除 sessionStorage
      window.sessionStorage.clear()
      // 重定向到登录页面
      this.$router.push('/login')
    },
    // 获取左侧菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      // 获取数据失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 获取数据成功
      this.menulist = res.data
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  position: absolute;
  width: 100%;
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
}
.el-aside {
  background-color: #333744;
  .el-menu{
      border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    cursor: pointer;
    letter-spacing: 0.2em;
}
</style>
