<template>
  <div>
    <div class="title"></div>
    <div class="bottom">
      <div class="left">
        <img :src="closePng" class="close" @click="CloseVideo">
      </div>
      <div class="right">
        <Icon type="md-expand" size="20" style="line-height:25px" @click="FullScreen()"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props:['hdlg'],
  data() {
    return {
      closePng: require("../../assets/images/close.png")
    };
  },
  methods: {
    CloseVideo(e){
      this.$emit('closevideo')
    },
    FullScreen(target) {
      let videoEl = event.target.parentElement.parentElement.parentElement;

      if (
        document.body.scrollHeight === window.screen.height &&
        document.body.scrollWidth === window.screen.width
      ) {
        this.$tools.exitFullscreen(videoEl);
        videoEl.dataset["isfullscreen"] = false;
      } else {
        this.$tools.launchIntoFullscreen(videoEl);
        videoEl.dataset["isfullscreen"] = true;
      }
    }
  }
};
</script>

<style lang="less">
</style>

