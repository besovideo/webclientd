<template>
  <div id="app" ref="app">
    <configset/>
    <router-view />
  </div>
</template>

<script>
import {mapState} from 'vuex'
import { scrypt } from 'crypto';
import configset from './components/configset/configset.vue';
import loginVue from './views/login/login.vue';
export default {
  name: 'App',
  components: {
    configset
  },
  data(){
    return {
      flash_tip: true ,
      fullscreenLoading: false,
      userName: '',
      password: '',
      Server: '',
      Server_Port: '',
    }
  },
  methods:{
    handleSubmit({
      userName,
      password,
      Server = "127.0.0.1",
      Server_Port = "9701",
    },cb=(()=>{})) {
      if (Server.trim() == "" || Server_Port.trim() == "") {
        this.$Message.error("Server port cannot be empty");
        return;
      }

      window.localStorage.setItem(
        "lastConnect",
        JSON.stringify({ Server, Server_Port })
      );

      let url = window.location.origin;
      // let url = 'https://115.28.79.237:9443'
      if (process.env.NODE_ENV == "development") {
        console.log('测试')
        // url = 'https://115.28.79.237:9443'
        // url = 'https://112.30.114.240:9443';
        // url = "https://192.168.8.7:9443";
        // url = 'https://61.191.27.18:9443'
        // url = 'https://192.168.0.68:9443'
        url = 'https://192.168.8.7:9443'
        // url = 'https://192.168.0.68:9443'
      }
      this.userName = userName;
      this.password = password;
      this.Server = Server;
      this.Server_Port = Server_Port;

      let initCode = window.jSW.swInit({
        // url: window.location.origin, //bv_nginx.exe服务器地址
        url,
        calltype: window.jSW.CallProtoType.HTTP, // AUTO: IE优先使用OCX, 如果希望IE仍然使用HTTP通信, 请使用jSW.CallProtoType.HTTP
        config: {
          bManualLP: true,
        },
        oninit: (code) => {
          if (code == jSW.RcCode.RC_CODE_S_OK) {
            this.$store.state.session = new window.jSW.SWSession({
              server: Server,
              port: Server_Port,
              onopen: (sess) => {
                sess.swLogin({
                  user: userName,
                  password: password,
                });
              },
            });

            window._session = this.$store.state.session;
            this.$store.state.session.swAddCallBack(
              "login",
              (...args)=>{ this.sessionCallback(cb,...args) }
            );
            this.$store.state.session.swAddCallBack("logout", () => {
              if (this.$store.state.session) {
                this.$store.state.session.swLogout();
              }
            });
            this.$store.state.session.swAddCallBack(
              "notify",
              this.notifyCallback
            );
          } else {
            this.$store.state.ErrorCode = code;
            console.log(code);
            switch (parseInt(code)) {
              case jSW.RcCode.RC_CODE_E_INVALIDIP:
                this.$Message.error("Server IP Error");
                break;
              case jSW.RcCode.RC_CODE_E_INVALIDPORT:
                this.$Message.error("Server Port Error");
                break;
              case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
                this.$Message.error("Connect Failed");
                break;
              case jSW.RcCode.RC_CODE_E_USERNAME:
              case jSW.RcCode.RC_CODE_E_PASSWORD:
                this.$Message.error("No User Or Password error");
                break;
              case jSW.RcCode.RC_CODE_E_BVCU_AUTHORIZE_FAILED:
                this.$Message.error("Authorize Failed");
                break;
              case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
                this.$Message.error("Connect Failed");
                break;
              default:
                this.$Message.error("Fail, error code: " + code);
                break;
            }
          }
        },
      });
      console.log("initCode:", initCode);
    },
    notifyCallback(sender, event, json) {
      console.log("notify: ", json.msg);

      switch (json.msg) {
        case "notify_pu_onoffline":
          console.log("notify_pu_onoffline");
          this.$store.state.notify = json.content;
          this.$store.state.notify_term = json.content;
          break;
      }
      // console.log('notify: ',sender, event, json);
    },
    sessionCallback(cb, sender, event, json) {
      console.log("Login:", json);
      this.$store.state.fullscreenLoading = false

      if (json.code == jSW.RcCode.RC_CODE_S_OK) {
        // window.localStorage.setItem('Server',this.Server)
        // window.localStorage.setItem('Server_Port',this.Server_Port)
        window.localStorage.setItem("userName", this.userName);

        window.localStorage.login_info = JSON.stringify({user: this.userName, pass: this.password, Server: this.Server, Server_Port: this.Server_Port })
        
        cb(true, {})
        this.$store.state.user = this.userName;
        this.$router.push({ path: window.localStorage.lastUrl || "/Monitor" });
      } else {
        this.$store.state.ErrorCode = json.code;
        let msg = "Fail, error code: " + json.code
        switch (parseInt(json.code)) {
          case jSW.RcCode.RC_CODE_E_INVALIDIP:
            msg = "Server IP Error"
            break;
          case jSW.RcCode.RC_CODE_E_INVALIDPORT:
            msg = "Server Port Error";
            break;
          case jSW.RcCode.RC_CODE_E_USERNAME:
          case jSW.RcCode.RC_CODE_E_PASSWORD:
            msg = "No User Or Password error";
            break;
          case jSW.RcCode.RC_CODE_E_BVCU_AUTHORIZE_FAILED:
            msg = "Authorize Failed"
            break;
          case jSW.RcCode.RC_CODE_E_BVCU_CONNECTFAILED:
            msg = "ConnectFailed"
            break;
        }
        this.$Message.error(msg)
        cb(false,{msg,code:parseInt(json.code) })

      }
    },
    openCheckFlash(version) {
      if(version<=75){
        let a = document.createElement('a')
        a.href = 'http://www.macromedia.com/go/getflashplayer'
        a.click()
      } else {
        this.flash_tip && this.$confirm(`${this.$t('Data.ciwangzhanxuyaokaiqiFlashgongneng')} <br> ${this.$t('Data.qingzaixinchuangkoudakaicilianjie,bingkaiqiFlashdequanxian')}<br>${"chrome://settings/content/siteDetails?site="+window.location.origin}
          <br>
          <input type="checkbox" id="notip" oninput="NoTip()"/> ${this.$t('Data.buzaitishi')}
        `, this.$t('Data.kaiqiFlash'), {
          confirmButtonText: this.$t('Data.queren'),
          cancelButtonText: this.$t('Data.quxiao'),
          dangerouslyUseHTMLString: true,
          closeOnClickModal: false,
          type: 'primary',
          center: true
        }).then(() => {
          
        }).catch(() => {
          
        })
      }
    }
  },
  watch:{
    ErrorCode(code){
      if(!code)return
      switch(code){
        case jSW.RcCode.RC_CODE_E_DISCONNECTED:
          this.$Message.error("WebSocket TimeOut");
          location.reload()
          // this.$router.push('/login')
        break
        default:
          console.log("Other:",code);
          break
      }
      this.$store.state.ErrorCode = undefined
    }
  },
  computed:{
    ...mapState({
      session: "session",
      ErrorCode: "ErrorCode",
    })
  },
  created() {
    var user = this.$tools.getQueryVariable("user");
    var pass = this.$tools.getQueryVariable("pass");
    var Server = this.$tools.getQueryVariable("server") || undefined;
    var Server_Port = this.$tools.getQueryVariable("port") || undefined;
    // window.onload = () => {
      

    
    // if (LoginInfo.user && LoginInfo.pass ) {
    //   this.$router.push('/nologin')
    // }

    console.log('user ', user, ' pass ',pass)
    if (!user || !pass) {
      let {user, pass} = JSON.parse(window.localStorage.login_info || '{}')
      if (user && pass) {
        this.$router.push('/nologin')
        return;
      }
      window.localStorage.login_info = ""
      this.$router.push('/login')
    } else {
      localStorage.login_info = JSON.stringify({user, pass,Server,Server_Port})
      window.location.search = ''
    }

    console.log(this.$store)
    window.NoTip = function() {
      let checked = document.querySelector("#notip").checked
      localStorage.flash_tip = !checked
    }

    if (localStorage.flash_tip == 'false' || !localStorage.flash_tip) {
      this.flash_tip = false
    }

    console.log(window.btoa('2019-9-23 09:30:09'))
    
    if(!this.$tools.checkFlash().f){
      // let target = navigator.userAgent.match(/Chrome\/(\d{2})/)
      // if(target==null) {
      //   this.$confirm(this.$t('Data.qingshiyongChromeneihe(jisumoshi)fangwengaiwangzhan'), this.$t('Data.tishi'), {
      //     confirmButtonText: this.$t('Data.queren'),
      //     cancelButtonText: this.$t('Data.quxiao'),
      //     type: 'primary',
      //     center: true
      //   })
      // }else if( target.length > 0){
      //   this.openCheckFlash(target[1])
      // }
    }
  },
  destroyed() {
    // jSW.swDeInit();
    layui.use(['layui','layim'], function(layim){
      var cache =  layui.layim.cache();
      var local = layui.data('layim')[cache.mine.id]; //获取当前用户本地数据
      
      //这里以删除本地聊天记录为例
      delete local.chatlog;
    })
  }
}

</script>

<style>
#app,
html,
body {
  height: 100%
}
.el-message-box.el-message-box--center{
  width: 500px
}
.ivu-message{
  z-index:99999999999999!important;
}
</style>