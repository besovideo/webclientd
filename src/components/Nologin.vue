<template>
  <div class="width: 100%; height: 100%"  v-loading.fullscreen.lock="$store.state.fullscreenLoading">
  </div>  
</template>

<script>
import { mapState } from 'vuex'
export default {
  created() {
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
    });
  }
}
</script>

<style>

</style>