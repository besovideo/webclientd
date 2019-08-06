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
  },
  destroyed() {
    jSW.swDeInit();
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
