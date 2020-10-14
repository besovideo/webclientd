<template>
  <div id="nologin" class="width: 100%; height: 100%"  v-loading.fullscreen.lock="$store.state.fullscreenLoading">
    <div class="content" v-if="msgObj">
      <p class="msgContent">
        <span class="msg el-tag ">{{msgObj.msg}} </span>
      </p>
      <el-tag class="code" size="small" type="danger">{{ msgObj.code }}</el-tag>&nbsp;
      <el-tag class="code" size="small"  type="danger"> <span style="color: orange;font-weight:700">{{ GetCodeKey(msgObj.code) }}</span></el-tag>
      <br>
      <el-button size="small" type="primary" @click="$router.push('/login')">{{$t('login.login')}}</el-button>
    </div>
  </div>  
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      msgObj: undefined
    }
  },
  methods:{ 
    GetCodeKey(code) {
      const RCode = jSW.RcCode

      for (const key in RCode) {
        if (RCode[key] == code) {
          return key
        }
      }
    },
    LoginCb(tag, { msg = '',code = -1 }) {
      console.log('tag ',tag)
      if (tag === false) {
        console.log("login cb: ",msg,code)
        this.msgObj =  { msg ,code }
      } else {
        this.msgObj = undefined
      }
    },
  },
  created() {
    // const RCode = jSW.RcCode
    // for (const key in RCode) {
      
    // }
    console.log(this.$route);
    
    this.$store.state.fullscreenLoading = true
    let { user, pass, Server, Server_Port } = JSON.parse(window.localStorage.login_info || '{}')
    console.log({ user, pass, Server, Server_Port } );
    this.fullscreenLoading = true
    this.$store.state.AutoLogin = true

    

    this.$root.$children[0].handleSubmit({
      userName: user,
      password: pass, 
      Server,
      Server_Port
    },this.LoginCb);
  }
}
</script>

<style lang="less" scoped>
#nologin {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
  .content {
    width: 600px;
    border-radius: 10px;
    box-shadow: 0 0 5px #ccc;
    text-align: center;
    padding: 20px;
    p.msgContent {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      span.msg {
        border-color: #fff;
        background: initial;
        color: orange;
        font-size: 20px;

      }
    }

    .code {
      margin-bottom: 20px;
    }
  }
}
</style>