<template>
  <!-- 后台页面 -->
  <el-container class="container">
    <!-- 头部区域 -->
    <el-header>
      <div class="title">
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 内容主体 -->
    <el-container>
      <!-- 侧边菜单 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="menuCollapse" @click="changeCollapse">|||</div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#2f363d"
          text-color="#fff"
          active-text-color="#3270ad"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="(item, index) in menulist"
            :key="item.id"
          >
            <!-- 一级菜单的模板 -->
            <template slot="title">
              <i :class="[icons[index]]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path "
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 菜单内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      index: 0,
      menulist: [],
      icons: [
        'el-icon-user-solid',
        'el-icon-monitor',
        'el-icon-s-goods',
        'el-icon-tickets',
        'el-icon-s-marketing',
      ],
      isCollapse: false,
      activePath:''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      this.menulist = res.data
      console.log(res)
    },
    changeCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath=activePath
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
}
</script>
<style Lang="less" scoped>
.el-header {
  background-color: black;
  display: flex;
  justify-content: space-between;
  color: white;
  font-size: 25px;
}

.title {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  margin-left: 20px;
}

.el-aside {
  background-color: #30373f;
}

.el-menu {
  border-right: none;
}

.el-main {
  background-color: whitesmoke;
}

.container {
  width: 100%;
  height: 100%;
}

.menuCollapse {
  background-color: rgba(47, 51, 97, 0.479);
  color: #fff;
  font-size: 10px;
  text-align: center;
  letter-spacing: 5px;
  cursor: pointer;
}
</style>