<template>
  <div class="videobox">
    <div class="head">
      <span v-if="ShowTag">{{$t("Monitor.channel")}}{{tag}}</span>
      <span v-if="Type" style="padding-left:10px;">{{$t("Monitor.Type")}}:({{Type}})</span>
    </div>
    <div class="videoEl">
      <div class="video_div"></div>
      <img class="playloading" v-if="playLoading&&!noPlay" :src="playbtn" width="100" alt @click="Play">
      <img
        class="playloading loading"
        v-if="(!playLoading&&Loading)"
        :src="playLoadingSrc"
        width="100"
      >
      <div class="control">
        <div class="left">
          <img :src="closePng" class="close item" @click="Close()">
        </div>
        <div class="right">
          <Icon type="md-expand item" size="20" style="line-height:25px" @click="FullScreen()"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: ["tag", "puid","tagEl","noPlay",'isopen'],
  data() {
    return {
      tagdata: undefined,
      playbtn: require("@/assets/images/Play-btn.png"),
      closePng: require("../../assets/images/close.png"),
      playLoadingSrc: require("@/assets/images/loading.png"),
      playLoading: true,
      Loading: true,
      channel: undefined,
      Type: undefined,
      ShowTag: false,
      OpenResult: undefined
    };
  },
  methods: {
    //全屏
    FullScreen() {
      this.session.swGetPuChanel(this.puid, parseInt(this.tag)).swFullScreen(0);
    },
    //停止播放
    Close() {
      console.log("===========close",this.tagEl)
      this.$emit("on-open",this.tagEl,false)
      if(this.noPlay){
        this.ShowTag = false
        this.Type = false
      }
      if (!this.channel) return;
      this.channel.swClose(this.tag);
      this.playLoading = true;
      this.Loading = true;
    },
    //播放逻辑
    Play() {
      if (this.puid == undefined) {
        this.$Message.error(this.$t("Monitor.plaseselectterm"));
        return;
      }
      this.channel = this.session.swGetPuChanel(this.puid, parseInt(this.tag));
      this.playLoading = false;
      
      let videoEl = document.querySelectorAll(".video_div")[parseInt(this.tagEl)];
      this.OpenResult = this.channel.swOpenEx({
        ismuti: false,
        div: videoEl,
        // bstretch: true,
        prototype: "rtmp",
        bstretch: true,
        callback: (options, response, dlg) => {
          console.log(options, response, dlg);
          this.Loading = false;
          if (response.emms.code == 0) {
            this.ShowTag = true
            this.Type = options.prototype;
            this.$emit("on-open",this.tagEl,true)
          } else {
            this.$Message.error(this.$t("Monitor.otheropenfail") + response.emms.code);
          }
        }
      });
    }
  },
  computed: {
    ...mapState({
      session: "session"
    })
  },
  watch: {
    puid(val) {
      if (val != undefined) {
        // this.tagdata = parseInt(this.tag);
        // let id = setInterval(() => {
        //   if (this.tagdata == 20) clearInterval(id);
        //   this.tagdata += 1;
        // }, 1000);
        
      }
    },
    tag(val,oldVal){
      if(val!=undefined){
        if(oldVal!=undefined){
          this.Close()
        }
        if(this.noPlay){
          this.Play()
        }
      }
    },
    OpenResult(val) {
      console.log(val);
      this.Loading = false;
      if (val != jSW.RcCode.RC_CODE_S_OK) {
        if (val == jSW.RcCode.RC_CODE_E_ALREADYEXIST) {
          this.$Message.error(this.$t("Monitor.isopenchannel"));
        } else if (val == jSW.RcCode.RC_CODE_E_UNSUPPORTED) {
          this.$Message.error(this.$t("Monitor.otheropenfail_rtmp")+val);
        } else {
          this.$Message.error(this.$t("Monitor.channelopenerror") + val);
        }
        this.channel = undefined
      }
    }
  },
  destroyed() {
    this.Close();
  }
};
</script>
<style lang="less" scoped>
.videobox {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  .head {
    position: absolute;
    top: 0;
    z-index: 9;
    width: 100%;
    height: 25px;
    line-height: 25px;
    font-size: 16px;
    font-weight: 700;
    padding-left: 10px;
    background-color: rgba(0, 0, 0, 0.3);
  }
  div.videoEl {
    // margin-top:25px;
    width: 100%;
    height: 100%;
    .video_div {
      width: 100%;
      height: 100%;
    }
    img.playloading {
      cursor: pointer;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    img.loading {
      animation: rotation 1.5s linear infinite;
    }

    div.control {
      position: absolute;
      width: 100%;
      padding: 0 10px;
      height: 25px;
      bottom: 0;
      background-color: #000;
      .item {
        cursor: pointer;
      }
      .left {
        float: left;
        height: 100%;
        img {
          width: 20px;
          margin-top: 2.5px;
        }
      }
      .right {
        float: right;
        height: 100%;
      }
    }
  }
}
@keyframes rotation {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
