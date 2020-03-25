<template>
  <div class="videobox" ref="VideoBox">
    <div class="head">
      <span v-if="ShowTag">{{ puname||"" }} {{ $t("Monitor.channel") }}{{ tag }}</span>
      <span v-if="Type" style="padding-left:10px;">{{ $t("Monitor.Type") }}:({{ Type }})</span>
    </div>
    <div class="videoEl">
      <div class="video_div" />
      <img
        v-if="playLoading&&!noPlay"
        class="playloading"
        :src="playbtn"
        width="100"
        alt
        @click="Play"
      />
      <img
        class="playloading loading"
        v-if="(!playLoading&&Loading)"
        :src="playLoadingSrc"
        width="100"
      />
      <div class="control">
        <div class="left">
          <img :src="closePng" class="close item unselectable" @click="Close()" />
        </div>
        <div class="right">
          <el-dropdown trigger="click" @command="DropdownClick" v-if="VideoTypeSetting">
            <span class="el-dropdown-link" style="margin-right:10px;margin-top: 2.5px">
              <a href="javascript:void(0)">
                <img
                  class="settingImg"
                  :src="require('@/assets/images/videoSet.png')"
                  width="20"
                  style="line-height: 30px"
                />
              </a>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                icon="ivu-icon ivu-icon-ios-apps"
                :disabled="$store.state.VideoType == 'auto'"
                :command="{'type':'videotype',val:'auto'}"
              >AUTO</el-dropdown-item>
              <el-dropdown-item
                icon="ivu-icon ivu-icon-ios-apps"
                :disabled="$store.state.VideoType == 'rtmp'"
                :command="{'type':'videotype',val:'rtmp'}"
              >RTMP</el-dropdown-item>
              <el-dropdown-item
                icon="ivu-icon ivu-icon-ios-apps"
                :disabled="$store.state.VideoType == 'hls'"
                :command="{'type':'videotype',val:'hls'}"
              >HLS</el-dropdown-item>
              <el-dropdown-item
                icon="ivu-icon ivu-icon-ios-apps"
                :disabled="$store.state.VideoType == 'httpflv'"
                :command="{'type':'videotype',val:'httpflv'}"
              >HttpFlv</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <img v-if="!Loading" :src="voice?volumeOpenSrc:volumeCloseSrc" class="voice" @click="voice = !voice">
          <Slider v-if="!Loading"  v-model="volume" :step="10"></Slider>
          <Icon
            type="md-expand item unselectable"
            size="20"
            style="line-height:25px"
            @click="FullScreen()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: [
    "tag",
    "puid",
    "tagEl",
    "noPlay",
    "isopen",
    "puname",
    "VideoTypeSetting"
  ],
  data() {
    return {
      tagdata: undefined,
      playbtn: require("@/assets/images/Play-btn.png"),
      closePng: require("../../assets/images/close.png"),
      playLoadingSrc: require("@/assets/images/loading.png"),
      volumeOpenSrc: require("@/assets/images/volumeOpen.png"),
      volumeCloseSrc: require("@/assets/images/volumeClose.png"),
      playLoading: true,
      Loading: true,
      channel: undefined,
      Type: undefined,
      ShowTag: false,
      OpenResult: undefined,
      volume: 100,
      voice: true
    };
  },
  methods: {
    DropdownClick(data) {
      if (data.type == "window") {
        this.videosize = data.val;
      } else if (data.type == "videotype") {
        localStorage.setItem("VideoType", data.val);

        if (this.$store.state.VideoType != data.val) {
          this.$store.state.VideoType = data.val;
          this.Play();
        }
      }
    },
    //全屏
    FullScreen() {
      if (this.channel != undefined)
        this.session
          .swGetPuChanel(this.puid, parseInt(this.tag))
          .swFullScreen(0);
    },
    //停止播放
    Close() {
      console.log("===========close", this.tagEl);
      this.$emit("on-open", this.tagEl, false);
      if (this.noPlay) {
        this.ShowTag = false;
        this.Type = false;
      }
      if (!this.channel) return;
      this.$store.state.ErrorCode = this.channel.swClose(this.tag);
      this.channel = undefined;
      this.playLoading = true;
      this.Loading = true;
    },
    //播放逻辑
    Play() {
      if (this.puid == undefined) {
        this.$Message.error(this.$t("Monitor.plaseselectterm"));
        return;
      }
      if (this.Loading && this.channel != undefined) {
        return;
      }
      this.Close();
      this.channel = this.session.swGetPuChanel(this.puid, parseInt(this.tag));
      this.playLoading = false;

      let videoEl = document.querySelectorAll(".video_div")[
        parseInt(this.tagEl)
      ];
      this.$store.state.ErrorCode = this.OpenResult = this.channel.swOpenEx({
        ismuti: false,
        div: videoEl,
        // bstretch: true,
        media: 10,
        prototype: this.$store.state.VideoType,
        bstretch: true,
        callback: (options, response, dlg) => {
          this.$store.state.ErrorCode = this.OpenResult = response.emms.code;
          console.log(options, response, dlg);
          console.log();

          this.Loading = false;
          if (response.emms.code == 0) {
            this.$store.state.notifyTip[this.puid] = false;
            this.Loading = false;
            this.ShowTag = true;
            this.Type = this.$store.state.VideoType;
            this.$emit("on-open", this.tagEl, true);
          }
        }
      });
    }
  },
  computed: {
    ...mapState({
      session: "session",
      notify: "notify"
    })
  },
  watch: {
    voice(val) {
      let video = this.$refs.VideoBox.querySelector("video")
      if(!video) return
      if(!val) {
        console.log(this.$refs.VideoBox)
        video.volume = 0
        this.volume = 0
      }
    },
    volume(val) {
      let video = this.$refs.VideoBox.querySelector("video")
      if(!video) return

      if(val == 0) {
        this.voice = false
        return
      }
      video.volume = val / 100
      this.voice = true
    },
    puid(val) {
      if (val != undefined) {
        // this.tagdata = parseInt(this.tag);
        // let id = setInterval(() => {
        //   if (this.tagdata == 20) clearInterval(id);
        //   this.tagdata += 1;
        // }, 1000);
      }
    },
    notify(val) {
      if (val == undefined && this.ShowTag) return;
      if (this.puid == val.content._id_pu) {
        if (!this.$store.state.notifyTip[this.puid]) {
          this.$Message.error(this.$t("Data.shebeiyilixian"));
          this.$store.state.notifyTip[this.puid] = true;
        }
        this.Close();
      }
    },
    // tag(val,oldVal){
    //   if(val!=undefined){
    //     if(oldVal!=undefined){
    //       this.Close()
    //     }
    //     if(this.noPlay){
    //       this.Play()
    //     }
    //   }
    // },
    OpenResult(val) {
      console.log(val);
      if (val != jSW.RcCode.RC_CODE_S_OK) {
        if (val == jSW.RcCode.RC_CODE_E_ALREADYEXIST) {
          this.$Message.error(this.$t("Monitor.isopenchannel"));
        } else if (val == jSW.RcCode.RC_CODE_E_UNSUPPORTED) {
          this.$Message.error(this.$t("Monitor.otheropenfail_rtmp") + val);
        } else if ((val = jSW.RcCode.RC_CODE_E_BVCU_FAILED)) {
          this.$Message.error("RC_CODE_E_BVCU_FAILED " + val);
        } else if ((val = jSW.RcCode.RC_CODE_E_BVCU_TIMEOUT)) {
          this.$Message.error("RC_CODE_E_BVCU_TIMEOUT " + val);
        } else {
          this.$Message.error(this.$t("Monitor.channelopenerror") + val);
        }
        if (this.Loading) {
          this.Loading = false;
          this.channel = undefined;
        }
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
    color: white;
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


<style lang="less">
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
    flex: 1;
    display: flex;
    height: 100%;
    .settingImg {
      width: 18px;
      height: 18px;
      margin-top: 2.5px;
    }
    .voice {
      display: block;
      width: 18px;
      margin-top: 3.5px;
      height: 18px;
      margin-right: 10px;
      cursor: pointer;
    }
    .ivu-slider {
      width: 50px;
      margin-right: 15px;
      .ivu-slider-wrap {
        margin: 0;
        margin-top: 10.5px;
        .ivu-slider-bar {
          background: #225fb5;
        }
        .ivu-slider-button-dragging {
          width: inherit;
        }
        .ivu-slider-button {
          width: 10px;
          height: 10px;
          border: 2px solid #225fb5
        }

      }
    }
  }
}
</style>
