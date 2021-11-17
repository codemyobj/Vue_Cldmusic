<template>
  <el-dialog
    :visible="isDialogShow"
    custom-class="registeredDialog"
    width="400px"
    append-to-body
    @close="closeRegistered"
  >
    <div class="registeredContainer">
      <div class="logo">
        <img src="~/assets/img/registered.png" alt="" />
      </div>
      <!-- 第一步 -->
      <el-form class="form" :model="userInfo" v-if="currentStep == 0">
        <el-form-item>
          <el-input
            class="mobile"
            prefix-icon="el-icon-mobile-phone"
            size="small"
            placeholder="请输入手机号"
            v-model="userInfo.mobile"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            class="password"
            prefix-icon="el-icon-lock"
            size="small"
            type="password"
            placeholder="设置登录密码"
            v-model="userInfo.password"
          />
          <div class="tip">
            密码8~20位，至少包含字母/数字/字符中组合
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            size="small"
            :loading="isButtonLoading"
            @click="submitCount"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 第二步 -->
      <el-form class="form" v-else-if="currentStep === 1">
        <el-form-item class="codeInput">
          <el-input
            class="mobile"
            prefix-icon="el-icon-key"
            size="small"
            placeholder="请填写验证码"
            v-model="code"
          />
          <div class="codeButtonContainer">
            <div class="codeButton" v-if="!isCountDownShow" @click="getCode">
              获取验证码
            </div>
            <div class="countDown" v-else>{{ countDown }} <span>s</span></div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="submitCode"
            size="small"
            :loading="isButtonLoading"
          >
            下一步
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 第三步 -->
      <el-form class="form" v-else-if="currentStep === 2">
        <el-form-item>
          <el-input
            class="mobile"
            prefix-icon="el-icon-user"
            size="samll"
            placeholder="请输入昵称"
            v-model="userInfo.nickname"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            @click="finishRegistered"
            size="small"
            :loading="isButtonLoading"
          >
            完成注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
// 倒计时的定时器名称
let timer;
export default {
  components: {},
  name: "Registered",
  props: {
    isDialogShow: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      // 当前注册的步骤索引
      currentStep: 0,
      // 当前绑定的注册的用户信息
      userInfo: {
        mobile: "",
        password: "",
        nickname: "",
      },
      // 是否使注册按钮加载
      isButtonLoading: false,
      //倒计时长
      countDown: 60,
      // 验证码
      code: "",
      // 是否显示倒计时
      isCountDownShow: false,
    };
  },
  methods: {
    // 请求

    // 点击注册按钮
    async submitCount() {
      this.isButtonLoading = true;
      if (
        this.userInfo.password.length < 8 ||
        this.userInfo.mobile.length !== 11
      ) {
        this.$message.warning("手机号码或者密码格式错误");
        this.isButtonLoading = false;
        return;
      }

      // 先验证手机号是否已经存在
      let verifyMobie = await this.$request("/cellphone/existence/check", {
        phone: this.userInfo.mobile,
      });
      // 如果手机号不存在 发送验证码
      if (verifyMobie.data.exist !== 1) {
        await this.getCode();
        // 请求结束后按钮设为正常状态
        this.isButtonLoading = false;
        // 进入注册第二个步骤
        this.currentStep = 1;
      } else {
        this.isButtonLoading = false;
        this.$message.warning("此手机号已经注册过了哦,请直接登录！");
        // 关闭注册框
        this.$emit("closeRegistered");
      }
    },

    // 获取验证码
    async getCode() {
      let getCode = await this.$request("/captcha/sent", {
        phone: this.userInfo.mobile,
      });

      if (getCode.data.code === 200) {
        // 开始倒计时
        this.countDown = 60;
        this.isCountDownShow = true;
        timer = setInterval(() => {
          if (this.countDown === 0) {
            clearInterval(timer);
            this.isCountDownShow = false;
            return;
          }
          this.countDown--;
        }, 1000);
      } else {
        this.$message.error(getCode.data.message);
      }
    },

    // 上传验证码
    async submitCode() {
      // 按钮设为加载状态
      this.isButtonLoading = true;
      if (this.code.length !== 4) {
        this.isButtonLoading = false;
        this.$message.warning("验证码格式错误");
        return;
      }

      let verifyCode = await this.$request("/captcha/verify", {
        phone: this.userInfo.mobile,
        captcha: this.code,
      }).catch((err) => {
        this.$message.error(err.response.data.message);

        // 重置按钮状态
        this.isButtonLoading = false;
      });

      if (!verifyCode) {
        return;
      }
      // 请求结束后按钮设为正常状态
      this.isButtonLoading = false;
      if (verifyCode.data.data) {
        // 验证通过
        // 进入注册第三个步骤 设置昵称
        this.currentStep = 2;
      }
    },

    async finishRegistered() {
      this.isButtonLoading = true;
      let res = await this.$message("/register/cellphone", {
        captcha: this.code,
        phone: this.userInfo.mobile,
        password: this.userInfo.password,
        nickname: this.userInfo.nickname,
      }).catch((err) => {
        this.$message.error(err.response.data.message);
        this.isButtonLoading = false;
      });

      if (!res) {
        return;
      }

      // 请求结束
      this.isButtonLoading = false;
      if (res.data.code === 200) {
        this.$message.success("注册成功!");
        this.$emit("closeRegistered");
      } else {
        this.$message.error("注册失败!");
      }
    },

    // 点击关闭注册框
    closeRegistered() {
      // 重置所有数据
      this.userInfo = {
        mobile: "",
        password: "",
        nickname: "",
      };
      this.currentStep = 0;
      this.code = "";
      this.isButtonLoading = false;
      this.isCountDownShow = false;
      this.countDown = 60;

      this.$emit("closeRegistered");
    },
  },
};
</script>
<style scoped lang="less">
.registeredContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 50%;
  img {
    width: 100%;
  }
}

.form {
  width: 100%;
  text-align: center;
  .el-input /deep/ input {
    background-color: #fff !important;
    border: 1px solid #ccc;
    margin: 10px 0;
    color: rgb(95, 95, 95) !important;
  }

  .el-input /deep/input::-webkit-input-placeholder {
    color: #ccc !important;
    font-size: 12px;
  }

  .el-input /deep/ .el-input__icon {
    color: #aaa;
    width: 14px;
    height: 105%;
  }

  /deep/ .el-form-item {
    margin: 0;
  }

  .el-button {
    background-color: #e74e4e;
    color: #fff;
    width: 80%;
    border: none;
    height: 33px;
    margin-top: 20px;
    border-radius: 5px;
  }

  .el-button:hover {
    color: #fff;
    background-color: #ec2424;
  }

  .el-button:focus {
    color: #fff;
  }

  .tip {
    font-size: 12px;
    color: #bbb;
    line-height: 10px;
    transform: scale(0.9) translate(-1%, -30%);
  }

  .codeInput {
    position: relative;
  }

  .codeButtonContainer {
    position: absolute;
    right: 48px;
    top: 13px;
  }

  .codeButton {
    background-color: #e74e4e;
    color: rgb(245, 245, 245);
    font-size: 12px;
    padding: 5px 12px;
    line-height: 15px;
    border-radius: 5px;
    transform: scale(0.9);
    cursor: pointer;
  }

  .codeButton:hover {
    background-color: #ec2424;
  }

  .countDown {
    color: rbg(134, 134, 134);
    line-height: 25px;
    font-size: 12px;
    span {
      margin-left: 1px;
    }
  }
}
</style>
