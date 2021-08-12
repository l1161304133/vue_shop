<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 用户卡片内容 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>用户列表</span>
      </div>
      <el-row :gutter="20">
        <!-- 搜索框与添加按钮 -->
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable
              @clear="getUserList()">
              <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="changeVisible">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 用户表格 -->
      <el-table :data="userlist" :border="true" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="名称" prop="username"></el-table-column>
        <el-table-column label="联系电话" prop="mobile"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <!-- 更新用户状态 -->
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <!-- 编辑删除控制权限 -->
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delUserInfoById(scope.row.id)">
            </el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户区域，一个对话框里面嵌套一个form -->
    <el-dialog title="添加用户" :visible.sync="addUserVisible" width="50%" :before-close="handleClose"
      @close="addUserFormReset">
      <el-form :model="addUserForm" status-icon :rules="addUserFormRules" ref="addUserFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog title="编辑用户" :visible.sync="editUserVisible" width="50%" :before-close="handleClose"
      @close="editUserFormReset">
      <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" :before-close="handleClose" @close="resetRolesDialog">
      <p>当前用户：{{userInfo.username}}</p>
      <p>当前角色：{{userInfo.role_name}}</p>
      <p>分配角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    data() {
      // 自定义验证规则
      var checkEmail = (rule, value, cb) => {
        // 邮箱验证正则表达式
        const pattern = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/;
        if (pattern.test(value)) {
          return cb()
        }
        cb(new Error('邮箱格式不正确！'))
      }

      var checkMobile = (rule, value, cb) => {
        let phoneCheck = /^((13[0-9])|(17[0-1,6-8])|(15[^4,\\D])|(18[0-9]))\d{8}$/;
        if (phoneCheck.test(value)) {
          return cb()
        }
        cb(new Error('手机号格式不正确！'))
      }
      return {


        // 获取用户列表的对象参数
        queryInfo: {
          query: '',
          // 第几页
          pagenum: 1,
          // 一页有几条数据
          pagesize: 2
        },
        userlist: [],
        // 总共有多少条数据
        total: 0,
        // 控制表单显示隐藏
        addUserVisible: false,
        editUserVisible: false,
        // 表单内容
        addUserForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 校验规则
        addUserFormRules: {
          username: [{
              min: 3,
              max: 10,
              message: '用户名长度在3-10位数之间！',
              trigger: 'blur'
            },
            {
              required: true,
              message: '请输入用户名！',
              trigger: 'blur'
            }
          ],
          password: [{
              min: 3,
              max: 10,
              message: '密码长度在3-10位数之间！',
              trigger: 'blur'
            },
            {
              required: true,
              message: '请输入密码！',
              trigger: 'blur'
            },
          ],
          email: [{
            required: true,
            message: '请输入邮箱！',
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }],
          mobile: [{
            required: true,
            message: '请输入手机号！',
            trigger: 'blur'
          }, {
            validator: checkMobile,
            trigger: 'blur'
          }]
        },
        // 编辑用户验证规则
        editUserFormRules: {
          email: [{
              required: true,
              message: '请输入邮箱！',
              trigger: 'blur'
            },
            {
              validator: checkEmail,
              trigger: 'blur'
            }
          ],
          mobile: [{
              required: true,
              message: '请输入手机号！',
              trigger: 'blur'
            },
            {
              validator: checkMobile,
              trigger: 'blur'
            }
          ]
        },
        // 获取到的编辑用户数据放在这里面
        editUserForm: {},
        setRolesDialogVisible: false,
        // 当前用户信息
        userInfo: {},
        // 角色列表
        rolesList: [],
        // 已选的角色id
        selectedRoleId: ''

      }
    },
    methods: {
      // 从后端得到users的数据
      async getUserList() {
        const {
          data: res
        } = await this.$http.get('users', {
          params: this.queryInfo
        })
        if (res.meta.status != 200) return this.$message.error('获取列表失败！')
        this.userlist = res.data.users
        this.total = res.data.total
      },
      // 改变每一页显示的数量
      handleSizeChange(newPageSize) {
        this.queryInfo.pagesize = newPageSize
        this.getUserList()
      },
      // 改变页码，显示第几页
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      // 请求修改用户状态
      async userStateChange(userInfo) {
        // console.log(userInfo)
        const {
          data: res
        } = await this.$http.put(
          `users/${userInfo.id}/state/${userInfo.mg_state}`
        )
        if (res.meta.status != 200) {
          this.userInfo.mg_state = !this.userInfo.mg_state
          return this.$message.error('更新用户状态失败！')
        }
        return this.$message.success('更新用户状态成功！')
      },
      // 改变表单显示/隐藏
      changeVisible() {
        this.addUserVisible = !this.addUserVisible
      },
      // 监听关闭
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(() => {
            done();
          })
          .catch(() => {});
      },
      // 表单内容重置
      addUserFormReset() {
        this.$refs.addUserFormRef.resetFields()
      },
      // 提交前的预验证
      addUser() {
        this.$refs.addUserFormRef.validate(async valid => {
          if (!valid) return;
          const {
            data: res
          } = await this.$http.post('users', this.addUserForm)
          if (res.meta.status != 201) {
            return this.$message.error('添加用户失败！')
          }
          this.$message.success('添加用户成功！')
          this.addUserVisible = false
          this.getUserList()
        })
      },
      // 获取用户数据，get方法
      async editUserDialog(id) {
        const {
          data: res
        } = await this.$http.get('users/' + id)
        if (res.meta.status != 200) {
          return this.$message.error('获取用户信息失败！')
        }
        this.editUserForm = res.data
        this.editUserVisible = !this.editUserVisible
      },
      // 监听表单关闭
      editUserFormReset() {
        this.$refs.editUserFormRef.resetFields()
      },
      editUserInfo() {
        this.$refs.editUserFormRef.validate(async valid => {
          if (!valid) return this.$message.error('验证失败！')
          // 发起修改用户的请求
          const {
            data: res
          } = await this.$http.put('users/' + this.editUserForm.id, this.editUserForm)
          if (res.meta.status != 200) {
            return this.$message.error('修改失败！')
          }
          this.getUserList()
          this.editUserVisible = false
          return this.$message.success('修改成功！')

        })

      },
      async delUserInfoById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult == 'confirm') {
          const {
            data: res
          } = await this.$http.delete('users/' + id)
          if (res.meta.status != 200) {
            return this.$message.error('操作失败！')
          }
          this.getUserList()
          return this.$message.success('删除成功！')

        }
      },
      // 分配角色，打开对话框，获取数据并渲染
      async setRoles(userInfo) {

        const {
          data: res
        } = await this.$http.get('roles')
        this.rolesList = res.data
        if (res.meta.status != 200) return this.$message.error('操作失败')
        // console.log(res);
        this.userInfo = userInfo
        this.setRolesDialogVisible = true
      },
      async saveRoleInfo() {
        if (!this.selectedRoleId == true) return this.$message.error('请选择一个角色！')
        // console.log(this.selectedRoleId);
        const {
          data: res
        } = await this.$http.put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedRoleId
        })
        console.log(res);
        if (res.meta.status != 200) {
          this.setRolesDialogVisible = false
          return this.$message.error(`${res.meta.msg}`)
          
        }
        this.$message.success(`${res.meta.msg}`)
        this.setRolesDialogVisible = false
        this.getUserList()

      },
      resetRolesDialog(){
        this.userInfo=[]
        this.selectedRoleId=''
      }
    },
    created() {
      this.getUserList()
    }
  }
</script>
<style Lang="less" scoped></style>