<template>
  <div id='app'>
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  data(){
    return {
      session: ''
    }
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
