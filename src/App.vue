<template>
  <div id="app" ref="app">
    <router-view />
  </div>
</template>

<script>
import {mapState} from 'vuex'
import { scrypt } from 'crypto';
export default {
  name: 'App',
  data(){
    return {
    }
  },
  methods:{
    openCheckFlash(version) {
      if(version<=75){
        let a = document.createElement('a')
        a.href = 'http://www.macromedia.com/go/getflashplayer'
        a.click()
      } else {
        this.$confirm(`${this.$t('Data.ciwangzhanxuyaokaiqiFlashgongneng')} <br> ${this.$t('Data.qingzaixinchuangkoudakaicilianjie,bingkaiqiFlashdequanxian')}<br>${"chrome://settings/content/siteDetails?site="+window.location.origin}`, this.$t('Data.kaiqiFlash'), {
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
      ErrorCode: "ErrorCode"
    })
  },
  created() {
    if(!this.$tools.checkFlash().f){
      let target = navigator.userAgent.match(/Chrome\/(\d{2})/)
      if(target==null) {
        this.$confirm(this.$t('Data.qingshiyongChromeneihe(jisumoshi)fangwengaiwangzhan'), this.$t('Data.tishi'), {
          confirmButtonText: this.$t('Data.queren'),
          cancelButtonText: this.$t('Data.quxiao'),
          type: 'primary',
          center: true
        })
      }else if( target.length > 0){
        this.openCheckFlash(target[1])
      }
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