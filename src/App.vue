<template>
  <div id="app" ref='app'>
    <router-view />
  </div>
</template>

<script>

import {mapState} from 'vuex'
export default {
  name: 'App',
  data(){
    return {
    }
  },
  methods:{
    openCheckFlash() {
        this.$confirm(`${this.$t('Data.ciwangzhanxuyaokaiqiFlashgongneng')},${this.$t('Data.shifoukaiqi')}?`, this.$t('Data.kaiqiFlash'), {
          confirmButtonText: this.$t('Data.queren'),
          cancelButtonText: this.$t('Data.quxiao'),
          type: 'primary',
          center: true
        }).then(() => {
          let a = document.createElement('a')
          a.href = 'http://www.macromedia.com/go/getflashplayer'
          a.click()
        }).catch(() => {
          
        });
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
      this.openCheckFlash()
    }
  },
  destroyed() {
    jSW.swDeInit();
    layui.use('layim', function(layim){
      var cache =  layui.layim.cache();
      var local = layui.data('layim')[cache.mine.id]; //获取当前用户本地数据
      
      //这里以删除本地聊天记录为例
      delete local.chatlog;
    })
  }
};
</script>

<style>
#app,
html,
body {
  height: 100%;
}
</style>
