<script setup lang="ts" name="Login">
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import { is } from '@electron-toolkit/utils'
import { isAlphanumeric, isEmail } from 'validator'
import { md5 } from 'js-md5'
import { useUserInfoStore } from '../stores/userInfoStore'
const userInfoStore = useUserInfoStore()
import { useRouter } from 'vue-router'

const router = useRouter()
const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref()
const showLoading = ref(false)


const validateRePass = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: proxy.Verify.checkEmail,
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', min: 5, message: '密码至少5个字符', trigger: 'blur' },
    //密码必须要是数字和字母的组合
    {
      validator: proxy.Verify.checkPassword,
      trigger: 'blur'
    }
  ],
  rePassword: [
    {
      validator: validateRePass,
      trigger: 'blur'
    }
  ],
  nickName: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    },
    {
      min: 3,
      message: '用户名的长度至少为3个字符',
      trigger: 'blur'
    }
  ],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}


// 记录后端发来的验证码图片的url
const checkCodeUrl = ref(null)
// 生成验证码
const changeCheckCode = async () => {
  const result = await proxy.Request({
    url: proxy.Api.checkCode
  })
  if (!result) {
    return
  }
  checkCodeUrl.value = result.data.checkCode
  //需要将验证码key保存起来
  localStorage.setItem('checkCodeKey', result.data.checkCodeKey)
}
//第一次到login页面的时候，就需要生成对应的验证码信息
changeCheckCode()

// 判断当前是否是登录状态，在登录成功后会修改为false
const isLogin = ref(true)
//登录方法
const submitForm = async () => {
  //登录没有返回结果的时候进入等待的动画
  if (isLogin.value) {
    showLoading.value = true
  }
  const result = await proxy.Request({
    url: isLogin.value ? proxy.Api.login : proxy.Api.register,
    showLoading: isLogin.value ? false : true,
    showError: true,
    params: {
      email: formData.value.email,
      password: isLogin.value ? md5(formData.value.password) : formData.value.password,
      checkCode: formData.value.checkCode,
      nickName: formData.value.nickName,
      checkCodeKey: localStorage.getItem('checkCodeKey')
    },
    // 登录失败回调函数
    errorCallback: (response) => {
      // 停止加载loading 图片
      showLoading.value = false
      // 重新刷新验证码
      changeCheckCode()
      // errorMsg = response.info
    }
  })

  if (!result) {
    return
  }

  if (isLogin.value) {
    //如果是登录成功
    userInfoStore.setUserInfo(result.data)
    // 后端生成的token信息存储到localStorage中
    localStorage.setItem('token', result.data.token)
    // 切换达到main页面
    router.replace('/main')
    // 响应的需要调整界面
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height
    //登录成功后需要和主进程交互
    window.ipcRenderer.send('openChat', {
      email: result.data.email,
      token: result.data.token,
      userId: result.data.userId,
      nickName: result.data.nickName,
      admin: result.data.admin,
      screenWidth: screenWidth,
      screenHeight: screenHeight
    })
  } else {
    //如果是注册成功
    proxy.Message.success('注册成功')
    //改变isLogin状态
    changeLoginType()
  }
}

//修改登录状态的标识
const changeLoginType = () => {
  window.ipcRenderer.send('loginOrRegister', !isLogin.value)
  isLogin.value = !isLogin.value
  //每一次切换都需要清空
  nextTick(() => {
    clearErrors()
    formDataRef.value.resetFields()
  })
}

// 清除单个form中的信息
const clearError = (prop) => {
  if (formDataRef.value) {
    formDataRef.value.clearValidate(prop)
  }
}

// 清除所有form中的信息
const clearErrors = () => {
  if (formDataRef.value) {
    formDataRef.value.clearValidate()
  }
}
</script>

<template>
  <div class="login-panel">
    <!--v-if 区分开加载图片和提交的表单信息-->
    <div class="title drag">EasyChat</div>
    <div class="loading-panel" v-if="showLoading">
      <img src="../assets/img/loading.gif" />
    </div>
    <div class="login-form" v-else>
      <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="0px" @submit.prevent>
        <!-- 输入邮箱 -->
        <el-form-item prop="email">
          <el-input
            size="large"
            clearable
            placeholder="请输入邮箱"
            v-model.trim="formData.email"
            @focus="clearError('email')"
          >
            <!--#prepend插槽，是输入框的前置内容，也就是邮箱、密码登图标信息-->
            <template #prepend>
              <span class="iconfont icon-email"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 输入昵称 -->
        <el-form-item prop="nickName">
          <el-input
            size="large"
            :rules="rules"
            clearable
            placeholder="请输入昵称"
            v-model.trim="formData.nickName"
            v-if="!isLogin"
            @focus="clearError('nickName')"
          >
            <template #prepend>
              <span class="iconfont icon-user-nick"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 输入密码 -->
        <el-form-item prop="password">
          <el-input
            size="large"
            :rules="rules"
            clearable
            placeholder="请输入密码"
            v-model.trim="formData.password"
            show-password
            @focus="clearError('password')"
          >
            <template #prepend>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!--再次输入密码-->
        <el-form-item prop="rePassword">
          <el-input
            size="large"
            :rules="rules"
            clearable
            placeholder="请再次输入密码"
            v-model.trim="formData.rePassword"
            v-if="!isLogin"
            show-password
            @focus="clearError('rePassword')"
          >
            <template #prepend>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              size="large"
              :rules="rules"
              clearable
              placeholder="请输入验证码"
              v-model.trim="formData.checkCode"
              @focus="clearError('checkCode')"
            >
              <template #prepend>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <!--验证码展示，并且可以点击切换验证码-->
            <img :src="checkCodeUrl" @click="changeCheckCode" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="submitForm"
            >{{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
        <div class="bottom-link" @click="changeLoginType">
          <span class="a-link">{{ isLogin ? '没有账户' : '已有账号' }}</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.email-select {
  width: 250px;
}

.loading-panel {
  height: calc(100vh - 32px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  img {
    width: 300px;
  }
}

.login-panel {
  background: #fff;
  border-radius: 3px;
  border: 1px solid #ddd;
  margin-top: 30px;

  .title {
    height: 30px;
    padding: 5px 0px 0px 10px;
  }

  .login-form {
    padding: 5px 15px 29px 15px;

    :deep(.el-input__wrapper) {
      box-shadow: none;
      border-radius: 0;
    }

    .el-form-item {
      border-bottom: 1px solid #ddd;
    }

    .email-panel {
      align-items: center;
      width: 100%;
      display: flex;

      .input {
        flex: 1;
      }

      .icon-down {
        margin-left: 3px;
        width: 16px;
        cursor: pointer;
        border: none;
      }
    }

    .error-msg {
      line-height: 30px;
      height: 30px;
      color: #fb7373;
    }

    .check-code-panel {
      display: flex;

      .check-code {
        cursor: pointer;
        width: 120px;
        margin-left: 5px;
      }
    }

    .login-btn {
      margin-top: 20px;
      width: 100%;
      background: #07c160;
      height: 36px;
      font-size: 16px;
    }

    .bottom-link {
      text-align: right;
    }
  }
}
</style>
