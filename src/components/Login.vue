<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box"></div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" label-width="0px" :rules="loginFormRules" :model="loginForm" class="login_form">
        <!-- 账号 -->
        <el-form-item prop="username">
          <el-input v-model.lazy.trim="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" v-model.lazy.trim="loginForm.password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <div class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //这是登录表单的数据对象
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        loginFormRules: {
          username: [{
              required: true,
              message: '请输入账号',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在 3 到 10 个字符',
              trigger: 'blur'
            }
          ],
          password: [{
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 6,
              max: 11,
              message: '长度在 6 到 11 个字符',
              trigger: 'blur'
            }
          ]
        }
      }
    },
    methods: {
      resetLoginForm() {
        //console.log(this);
        this.$refs.loginFormRef.resetFields()
      },
      login() {
        this.$refs['loginFormRef'].validate(async valid => {
          if (!valid) return
          const result = await this.$http.post('login', this.loginForm)
          console.log(result.data)
          if (result.data.meta.status != 200) {
            //console.log("登录失败");
            this.$message({
              duration:1000,
              message: '登录失败！',
              type: 'error'
            })
          } else {
            this.$message({
              duration:1000,
              message: '登录成功！',
              type: 'success'
            })
            //console.log("登录成功");
            //console.log(result);
            // 1.将登录成功的token保存到sessionStorage中
            //  1.1项目中除了登录以外的其他api接口都必须登录之后才能访问
            //  1.2token只应当在当前网站打开期间生效，因此将token保存在sessionStorage中
            // 2.通过编程导航跳转到后台主页，路由地址是/home 配了吓路由
            window.sessionStorage.setItem('token', result.data.data.token)
            this.$router.push('/home')
          }
        })
      }
    }
  }
</script>

<style Lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    height: 350px;
    width: 450px;
    background-color: white;
    border-radius: 10%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    width: 150px;
    height: 150px;
    background-image: url(../assets/logo.png);
    background-position: center;
    border-radius: 50%;
    border: 1px solid #eee;
    margin: auto;
    background-size: 100%;
    background-repeat: no-repeat;
    box-shadow: 0 0 10px #eee;
    margin-top: -75px;
    background-color: #fff;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }

  .login_form {
    width: 100%;
    position: absolute;
    box-sizing: border-box;
    padding: 20px;
    top: 30%;
  }
</style>