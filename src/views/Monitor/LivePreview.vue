<template>
  <div class="body">
    <div class="body_left">
      <!-- <Tabs type="card" name="list" key="list" :value="tabs" id="list" :animated="false">
        <TabPane label="组织单元" name="tissue" tab="list">
        </TabPane>
        <TabPane label="我的收藏" name="Collection" tab="list"></TabPane>
      </Tabs>-->
      <Input class="search" @on-search="searchPu" search clearable placeholder/>
      <div class="showonline">
        <Checkbox class="cb" v-model="isOnline">{{$t('Monitor.Showonlyonlinedevices')}}</Checkbox>
      </div>
      <div class="list">
        <div>
          <Tree class="tree" :data="Pu_List" :load-data="loadData" multiple></Tree>
          <Spin fix v-if="treeListModal">
            <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
            <div>Loading</div>
          </Spin>
        </div>
      </div>
      <div class="left_bottom">
        <Page
          :current="CurrentPage"
          :total="Total"
          show-total
          :page-size="PageSize"
          simple
          @on-change="ChangePage"
        >共{{Total}}个设备</Page>
      </div>
    </div>
    <div id="right_content" v-if="videosize==1" key="1">
      <live-video class="_video _video1" id="video0" @closevideo="CloseVideo(0)" key="_1"></live-video>
    </div>
    <div id="right_content" v-if="videosize==4" key="4">
      <!-- <video-player ref="videoPlayer" style="vertical-align:top" :options="playerOptions"></video-player> -->
      <live-video class="_video _video4" id="video0" @closevideo="CloseVideo(0)" key="_2"></live-video>
      <live-video class="_video _video4" id="video1" @closevideo="CloseVideo(1)" key="_3"></live-video>
      <live-video class="_video _video4" id="video2" @closevideo="CloseVideo(2)" key="_4"></live-video>
      <live-video class="_video _video4" id="video3" @closevideo="CloseVideo(3)" key="_5"></live-video>
    </div>
    <div id="right_content" v-if="videosize==9">
      <live-video class="_video _video9" id="video0" @closevideo="CloseVideo(0)" key="_6"></live-video>
      <live-video class="_video _video9" id="video1" @closevideo="CloseVideo(1)" key="_7"></live-video>
      <live-video class="_video _video9" id="video2" @closevideo="CloseVideo(2)" key="_8"></live-video>
      <live-video class="_video _video9" id="video3" @closevideo="CloseVideo(3)" key="_9"></live-video>
      <live-video class="_video _video9" id="video4" @closevideo="CloseVideo(4)" key="_10"></live-video>
      <live-video class="_video _video9" id="video5" @closevideo="CloseVideo(5)" key="_11"></live-video>
      <live-video class="_video _video9" id="video6" @closevideo="CloseVideo(6)" key="_12"></live-video>
      <live-video class="_video _video9" id="video7" @closevideo="CloseVideo(7)" key="_13"></live-video>
      <live-video class="_video _video9" id="video8" @closevideo="CloseVideo(8)" key="_14"></live-video>
    </div>
    <div id="right_bottom">
      <div class="rb_left">
        <!-- <Icon type="md-expand"  size='24' style="margin-top:3px" @click="FullScreen('#right_content')"/> -->
      </div>
      <div class="rb_right">
        <Dropdown
          trigger="hover"
          id="SetVideoNum"
          @on-click="ChangeVideoSize"
          placement="top-start"
        >
          <a href="javascript:void(0)">
            <Icon type="ios-apps" size="24" style="margin-top:3px"/>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem name="1">1x1</DropdownItem>
            <DropdownItem name="4">2x2</DropdownItem>
            <DropdownItem name="9">3x3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import LiveVideo from "../../components/Monitor/LiveVideo";
export default {
  name: "livePreview",
  components: {
    LiveVideo
  },
  data() {
    return {
      CurrentPage: 1,
      PageSize: 100,
      Total: 100,
      tabs: "tissue",
      session: undefined,
      treeListModal: true,
      isOnline: false,
      playerOptions: {
        muted: false,
        height: "500",
        controls: false,
        autoplay: true,
        sources: []
      },
      closePng: require("../../assets/images/close.png"),
      onlineImgUrl: require("../../assets/images/online.png"),
      OfflineImgUrl: require("../../assets/images/Offline.png"),
      videosize: 4,
      videoDivList: [
        {
          id: "video0",
          chanel: undefined,
          hdlg: undefined,
          device: undefined,
          num: undefined
        },
        {
          id: "video1",
          chanel: undefined,
          hdlg: undefined,
          device: undefined,
          num: undefined
        },
        {
          id: "video2",
          chanel: undefined,
          hdlg: undefined,
          device: undefined,
          num: undefined
        },
        {
          id: "video3",
          chanel: undefined,
          hdlg: undefined,
          device: undefined,
          num: undefined
        }
      ],
      videoTarget: 0,
      Pu_List: [
        {
          title: this.$t("Monitor.Server"),
          expand: true,
          render: (h, { root, node, data }) => {
            // data.title = data.title + '(设备数:'+this.Total+')'
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%",
                  height: "24px",
                  marginLeft: "4px"
                }
              },
              [
                h("span", [
                  h("i", {
                    class: "fa fa-server",
                    style: {
                      margin: "1.5px 8px 0 0",
                      "font-size": "22px"
                    }
                  }),
                  h("span", data.title)
                ])
              ]
            );
          },
          children: [
            // {
            //   title: '123',
            //   expand: true,
            //   children: [
            //     {
            //       title: "leaf 1-1-1",
            //       disabled: true
            //     },
            //     {
            //       title: "leaf 1-1-2",
            //       selected: false,
            //     }
            //   ]
            // }
          ]
        }
      ]
    };
  },
  methods: {
    ChangePage(page) {
      this.CurrentPage = page;
      if (this.isOnline) {
        this.GetPu(1);
      } else {
        this.GetPu(0);
      }
    },
    searchPu(val) {
      if (val == "") {
        if (this.isOnline) {
          this.GetPu(1);
        } else {
          this.GetPu(0);
        }
        return;
      }
      let result = this.$store.state.session.swGetPu(val);
      if (!result) {
        this.$Message.error(this.$t("Monitor.noTerm"));
        return;
      }
      this.$set(this.Pu_List[0], "children", [this.SetTreeData(result)]);
    },
    ChangeVideoSize(name) {
      this.videoDivList.forEach(el => {
        if (document.querySelector("#" + el.id + ">video-js")) {
          document.querySelector("#" + el.id + ">video-js").player.pause();
        }
      });
      this.videoDivList.forEach(el => {
        if (el.chanel != undefined) {
          el.chanel.swClose({ hdlg: 1 });
        }
      });
      this.videosize = parseInt(name);
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
    },
    loadData(item, callback) {
      console.log(item);
      setTimeout(() => {
        const data = [
          {
            title: "children",
            render: (h, { root, node, data }) => {
              return h(
                "span",
                {
                  style: {
                    display: "inline-block",
                    width: "100%",
                    marginLeft: "4px",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      const children = data.children || [];
                      children.push({
                        title: "appended node",
                        expand: true
                      });
                      this.$set(data, "children", children);
                    }
                  }
                },
                [
                  h("span", [
                    h("Icon", {
                      props: {
                        type: "ios-folder-outline"
                      },
                      style: {
                        marginRight: "8px",
                        color: "red"
                      }
                    }),
                    h("span", data.title)
                  ])
                ]
              );
            }
          },
          {
            title: "children"
          }
        ];
        callback(data);
      }, 1000);
    },
    SetTreeData(ele) {
      let data = {
        title: ele._name_pu || ele._id_pu,
        expand: false,
        isOnline: ele._info_pu.onlinestatus,
        disabled: ele._info_pu.onlinestatus != 1,
        render: (h, { root, node, data }) => {
          data.disabled = ele._info_pu.onlinestatus != 1;
          let url =
            ele._info_pu.onlinestatus == 1
              ? this.onlineImgUrl
              : this.OfflineImgUrl;
          return h(
            "span",
            {
              class: "PUName_ID",
              style: {
                cursor:
                  ele._info_pu.onlinestatus == 1 ? "pointer" : "not-allowed",
                color: ele._info_pu.onlinestatus == 1 ? "initial" : "#ccc"
              },
              on: {
                click: () => {
                  if (ele._info_pu.onlinestatus != 1) {
                    data.expand = false;
                    return;
                  }
                  if (ele._info_pu.onlinestatus == 1) {
                    data.expand = !data.expand;
                  }
                }
              }
            },
            [
              h("img", {
                domProps: {
                  src: url,
                  width: 22
                },
                style: {
                  width: "22px",
                  height: "22px",
                  verticalAlign: "top",
                  margin: "0 5px"
                }
              }),
              h("span", data.title)
            ]
          );
        },
        children: []
      };
      ele._arr_channel.forEach((el, i) => {
        data.children.push({
          title: this.$t("Monitor.channel") + i,
          id: ele._id_pu,
          disabled: ele._info_pu.onlinestatus != 1,
          render: (h, { root, node, data }) => {
            return h(
              "span",
              {
                class: "span",
                style: {
                  cursor:
                    ele._info_pu.onlinestatus == 1 ? "pointer" : "not-allowed",
                  color: ele._info_pu.onlinestatus == 1 ? "initial" : "#ccc"
                },
                on: {
                  click: () => {
                    this.ShowVideo(ele, i);
                  }
                }
              },
              [
                h("span", data.title),
                h("Icon", {
                  props: {
                    type: "ios-videocam"
                  },
                  style: {
                    margin: "0 5px 0 10px"
                  }
                }),
                h("Icon", {
                  props: {
                    type: "ios-musical-notes"
                  }
                })
              ]
            );
          }
        });
      });
      return data;
    },
    SetList(name) {
      if (this.$store.state.session[name].length > 0) {
        let temp = [];
        this.treeListModal = true;
          if(name=='_arr_pu'){
            //过滤在线设备，放到最前面
            let num = []
            if( (this.CurrentPage-1)*100 < this.$store.state.session['_arr_pu_online'].length){
              this.$store.state.session[name].forEach((el,i)=>{
                if(el._info_pu.onlinestatus==1){
                  num.push(i)
                }
              })
              num.filter(el=>el>99).forEach(_i=>{
                this.$store.state.session[name].forEach((el,i)=>{
                  if(el._info_pu.onlinestatus!=1){
                    let temp = this.$store.state.session[name][i];
                        this.$store.state.session[name][i] = this.$store.state.session[name][_i];
                        this.$store.state.session[name][_i] = temp
                    }
                })
              })
            }
          }

          this.$store.state.session[name].forEach((ele, i) => {
            this.Total = this.$store.state.session[name].length;
            if (
              i >= (this.CurrentPage - 1) * 100 &&
              i < (this.CurrentPage - 1) * 100 + 100
            ) {
              temp.push(this.SetTreeData(ele));
            }
          });

        if(this.Total==0){
          this.$set(this.Pu_List[0], "children", []);
          this.treeListModal = false;
          return
        }

        let SortTemp = [];
        temp.forEach(el => {
          if (el.isOnline) {
            SortTemp.unshift(el);
          } else {
            SortTemp.push(el);
          }
        });
        this.$set(this.Pu_List[0], "children", []);
        this.$set(this.Pu_List[0], "children", SortTemp);
        this.treeListModal = false;
        if (document.querySelector(".body_left>.list"))
          document.querySelector(".body_left>.list").scrollTop = 0;
      } else {
        this.$set(this.Pu_List[0], "children", []);
      }
    },
    CloseVideo(i) {
      // console.log(this.videoDivList[i])
      // let chanel = this.$store.state.session.swGetPuChanel(this.videoDivList[i].device._id_pu,this.videoDivList[i].num)
      if(this.videoDivList[i].chanel){
        document.getElementById("video" + i).firstChild.innerText = "";
        this.videoDivList[i].chanel.swClose({ hdlg: 1 });
        this.videoDivList[i].chanel = undefined;
      }
      // this.videoTarget = i
    },
    ShowVideo(ele, i) {
      if (ele._info_pu.onlinestatus != 1) return;
      // let videoList = this.videoDivList.filter(el => el.chanel == undefined);
      // if (videoList.length == 0) {
      //   // this.videoDivList[].chanel.swClose(this.videoDivList[0].hdlg);
      //   // this.videoDivList[0].chanel = undefined;
      //   this.$set(this.videoDivList[0],'chanel',undefined)
      //   videoList = this.videoDivList.filter(el => el.chanel == undefined);
      // }
      // let target = this.videoTarget
      let target = -1;
      // this.videoDivList.filter((el,i) =>{ if(el.chanel==undefined){ temp.push(i) } return el.chanel == undefined });
      let temp = 0
      this.videoDivList.forEach((el, i) => {
        if (el.chanel == undefined) {
          // console.log(i);
          if(temp==0){
            target = i;
            temp++;
          }
          return;
        }
      });
      if (target == -1) {
        this.$Message.error(this.$t('Monitor.Pleasecloseavideowindowfirst'))
        return
      }

      this.videoDivList[
        target
      ].chanel = this.$store.state.session.swGetPuChanel(ele._id_pu, i);

      var strVideoDivId = document.getElementById("video" + target);
      if (this.videoDivList[target].chanel) {
        var result = this.videoDivList[target].chanel.swOpenEx({
          // ismuti: true,
          div: strVideoDivId,
          prototype: "auto", //rtmp > hls
          bovertcp: true,
          callback: (options, response, dlghandle) => {
            console.log(options, response, dlghandle);
            // videoList[0].hdlg = dlghandle

            if(response.emms.code == 0){
              let type = this.videoDivList[target].chanel.swSrcType({ hdlg: 1 });
              strVideoDivId.firstChild.innerText =
                (ele._name_pu || ele._id_pu) +
                "_" +
                this.$t("Monitor.channel") +
                i;
              strVideoDivId.firstChild.append("\t(" + type + ")");
              this.videoDivList[
                  target
                ].chanel = this.$store.state.session.swGetPuChanel(ele._id_pu, i);
            }else{
              this.$Message.error(this.$t("Monitor.otheropenfail") + response.emms.code)
              // this.videoDivList[
              //   target
              // ].chanel.swHide({hdlg:1})
             strVideoDivId.lastElementChild.remove() 
              this.videoDivList[
                target
              ].chanel  = undefined
            }
            // console.log(type);


            // videoList[0].chanel.swClose({hdlg:1})
            // this.videoDivList[this.videoTarget].chanel.swClose({hdlg:1});
            
          }
        });

        if (result != jSW.RcCode.RC_CODE_S_OK) {
          if (result == jSW.RcCode.RC_CODE_E_ALREADYEXIST) {
            this.$Message.error(this.$t("Monitor.isopenchannel"));
          } else {
            this.$Message.error(this.$t("Monitor.otheropenfail") + result);
          }
          this.videoDivList[
              target
            ].chanel  = undefined
        } else if (result == 0) {
          // if (this.videoTarget == this.videoDivList.length-1) {
          //     this.videoTarget = 0;
          // } else {
          //   this.videoTarget += 1;
          // }
        }
      }
    },
    GetPu(status) {
      if (status == 1) {
        this.SetList("_arr_pu_online");
      } else {
        this.SetList("_arr_pu");
      }
    }
  },
  watch: {
    tabs(val) {
      console.log(val);
    },
    videosize(val) {
      this.videoDivList = [];
      this.videoTarget = 0;
      for (let i = 0; i < this.videosize; i++) {
        this.videoDivList.push({
          id: "video" + i,
          chanel: undefined,
          hdlg: undefined
        });
      }
    },
    // "$store.state.session._arr_pu"(val) {
    //   this.GetPu(this.isOnline ? 1 : 0);
    // },
    "$store.state.session._arr_pu_online"(val) {
      console.log('do');
      this.GetPu(this.isOnline ? 1 : 0);
      
    },
    isOnline(val) {
      this.CurrentPage = 1;
      if (val) {
        this.GetPu(1);
      } else {
        this.GetPu(0);
      }
    }
  },

  computed: {
    GetSession: () => {
      return this.$store.state.session;
    },
    player() {
      return this.$refs.videoPlayer.player;
    }
  },
  beforeDestroy() {
    this.videoDivList.forEach(el => {
        if (el.chanel != undefined) {
          el.chanel.swClose({ hdlg: 1 });
        }
      });
  },
  mounted() {

  },
  created() {
    console.log(this.$store.state.session);

    if(this.$store.state.session._arr_pu.length>0){
      this.GetPu(0);
    }else{
      this.$store.state.session.swGetPuList({status:3,callback:(sender, cmd, data)=>{
        this.GetPu(0);
      }})
    }

  },
  updated() {
  }
};
</script>

<style lang="less">
.body {
  height: 100%;
  display: flex;
}
.body_left {
  // float: left;
  background-color: #fff;
  z-index: 2;
  width: 255px;
  padding-right: 5px;
  display: flex;
  flex-direction: column;
  height: 100%;
  .search {
    margin: 0px 0 6px 0;
  }
  .showonline {
    .cb {
      font-size: 15px;
      margin-left: 10px;
    }
    height: 30px;
    font-size: 18px;
    background: rgb(242, 242, 242);
  }
  .list {
    // display: flex;
    // flex-direction: column;
    // padding-bottom: 40px;
    // flex: 1;
    position: relative;
    // height: 720px;
    height: calc(100% - 68px);
    overflow: auto;
    & > div {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .demo-spin-icon-load {
      animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
      from {
        transform: rotate(0deg);
      }
      50% {
        transform: rotate(180deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
  .left_bottom {
    height: 30px;
    margin-top: 3px;
    text-align: center;
  }
}
.ivu-tree ul {
  font-size: 15px !important;
}
.ivu-tree-arrow i {
  font-size: 19px;
}
#right_content {
  // position: fixed;
  height: 100%;
  width: 100%;
  flex: 1;
  background-color: rgb(47, 46, 56);
  padding: 0 0 30px 0;
  box-sizing: border-box;
  // display: flex;
  // flex-direction: column;
  ._video1 {
    width: 100%;
    height: 100%;
  }
  ._video_content {
    flex: 1;
    display: flex;
    flex-direction: row;
  }
  ._video4 {
    float: left;
    overflow: hidden;
    width: 50%;
    height: 50%;
  }
  ._video9 {
    float: left;
    overflow: hidden;
    width: 33.333%;
    height: 33.333%;
  }
  ._video {
    position: relative;
    border: 1px solid rgb(33, 41, 51);
    &:hover {
      border: 1px solid rgb(72, 123, 194);
    }
    .title {
      width: 100%;
      padding-left: 20px;
      position: absolute;
      top: 0;
      z-index: 10;
      line-height: 30px;
      font-size: 16px;
      color: #fff;
      background-color: rgba(0, 0, 0, 0);
    }
    &:hover .bottom {
      display: block;
    }
    .bottom {
      width: 100%;
      display: none;
      z-index: 9;
      height: 25px;
      position: absolute;
      bottom: 0;
      background-color: rgb(47, 46, 56);
      .left {
        float: left;
        padding: 0 0 0 5px;
        height: 100%;
        .close {
          cursor: pointer;
          float: left;
          display: block;
          width: 20px;
          margin-top: 3px;
        }
      }
      .right {
        float: right;
        padding: 0 5px 0 0;
        height: 100%;
        .fa {
          line-height: 25px;
          cursor: pointer;
          &:hover {
            color: rgb(52, 99, 165);
          }
        }
      }
    }
  }
}
#right_bottom {
  position: fixed;
  bottom: 0;
  z-index: 0;
  width: 100%;
  padding: 0 20px 0 255px;
  height: 30px;
  background-color: rgb(47, 46, 56);
  .rb_left {
    height: 100%;
    float: left;
  }
  .rb_right {
    height: 100%;
    float: right;
  }
}
.span {
  cursor: pointer;
  padding: 4px 4px;
  &:hover {
    background-color: #d5e8fc;
  }
}
.PUName_ID {
  cursor: pointer;
}
#SetVideoNum {
  .ivu-select-dropdown {
    top: -99px !important;
  }
  .ivu-dropdown-menu {
    min-width: initial;
  }
}
</style>


