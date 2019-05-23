<template>
  <div class="body">
    <div class="body_left">
      <!-- <Tabs type="card" name="list" key="list" :value="tabs" id="list" :animated="false">
        <TabPane label="组织单元" name="tissue" tab="list">
        </TabPane>
        <TabPane label="我的收藏" name="Collection" tab="list"></TabPane>
      </Tabs>-->
      <Input class="search" search clearable placeholder/>
      <div class="showonline">
        <Checkbox class="cb" v-model="isOnline">{{$t('Monitor.Showonlyonlinedevices')}}</Checkbox>
      </div>
      <div class="list">
        <div style="height: 100%;overflow:auto">
          <Tree class="tree" :data="Pu_List" :load-data="loadData" multiple></Tree>
        </div>
      </div>
      <div class="left_bottom">
        123
      </div>
    </div>
    <div id="right_content" v-if="videosize==1" key="1">
      <!-- <video-player ref="videoPlayer" style="vertical-align:top" :options="playerOptions"></video-player> -->
      <div class="_video" id="video0" style="float:left;width:100%;height:100%">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
    </div>
    <div id="right_content" v-if="videosize==4" key="4">
      <!-- <video-player ref="videoPlayer" style="vertical-align:top" :options="playerOptions"></video-player> -->
        <div class="_video _video4" id="video0">
          <div class="title"></div>
          <div class="bottom">
            <div class="right">
              <Icon
                type="md-expand"
                size="20"
                style="line-height:25px"
                @click="FullScreen()"
              />
            </div>
          </div>
        </div>
      <div class="_video _video4" id="video1">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      
        <div class="_video _video4" id="video2">
          <div class="title"></div>
          <div class="bottom">
            <div class="right">
              <Icon
                type="md-expand"
                size="20"
                style="line-height:25px"
                @click="FullScreen()"
              />
            </div>
          </div>
        </div>
        <div class="_video _video4" id="video3">
          <div class="title"></div>
          <div class="bottom">
            <div class="right">
              <Icon
                type="md-expand"
                size="20"
                style="line-height:25px"
                @click="FullScreen()"
              />
            </div>
          </div>
        </div>
    </div>
    <div id="right_content" v-if="videosize==9">
      <!-- <video-player ref="videoPlayer" style="vertical-align:top" :options="playerOptions"></video-player> -->
      <div class="_video _video9" id="video0" >
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video1"  >
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video2">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video3">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video4">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video5">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video6">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video7">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
      <div class="_video _video9" id="video8">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <Icon
              type="md-expand"
              size="20"
              style="line-height:25px"
              @click="FullScreen()"
            />
          </div>
        </div>
      </div>
    </div>
    <div id="right_bottom">
      <div class="rb_left">
        <!-- <Icon type="md-expand"  size='24' style="margin-top:3px" @click="FullScreen('#right_content')"/> -->
      </div>
      <div class="rb_right">
        <Dropdown trigger="hover" id="SetVideoNum" @on-click='ChangeVideoSize' placement='top-start'>
        <a href="javascript:void(0)">
          <Icon type="ios-apps" size='24' style="margin-top:3px"/>
        </a>
        <DropdownMenu slot="list" >
            <DropdownItem name='1'>1x1</DropdownItem>
            <DropdownItem name='4'>2x2</DropdownItem>
            <DropdownItem name='9'>3x3</DropdownItem>
        </DropdownMenu>
    </Dropdown>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "livePreview",
  data() {
    return {
      tabs: "tissue",
      session: undefined,
      isOnline: false,
      playerOptions: {
        muted: false,
        height: "500",
        controls: false,
        autoplay: true,
        sources: []
      },
      onlineImgUrl: require("../../assets/images/online.png"),
      OfflineImgUrl: require("../../assets/images/Offline.png"),
      videosize:4,
      videoDivList: [
        { id: "video0", chanel: undefined },
        { id: "video1", chanel: undefined },
        { id: "video2", chanel: undefined },
        { id: "video3", chanel: undefined }
      ],
      videoTarget: 0,
      Pu_List: [
        {
          title: this.$t('Monitor.Server'),
          expand: true,
          render: (h, { root, node, data }) => {
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%",
                  height: '24px',
                  marginLeft: "4px"
                }
              },
              [
                h("span", [
                  h("i", {
                    class: 'fa fa-server',
                    style: {
                      margin: "1.5px 8px 0 0",
                      'font-size': '22px'
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
    ChangeVideoSize(name){
      this.videoDivList.forEach(el=>{
        if(document.querySelector("#"+el.id+">video-js")){
          document.querySelector("#"+el.id+">video-js").player.pause()
        }
      })
      this.videosize = parseInt(name)
    },
    FullScreen(target) {
      
      let videoEl = event.target.parentElement.parentElement.parentElement;

        if(document.body.scrollHeight === window.screen.height && document.body.scrollWidth === window.screen.width){
          this.$tools.exitFullscreen(videoEl);
          videoEl.dataset["isfullscreen"] = false;
        }else{
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
    SetList(name) {
      if (this.$store.state.session[name].length > 0) {
        let temp = [];
        this.$store.state.session[name].forEach(ele => {
          let data = {
            title: ele._name_pu || ele._id_pu,
            expand: false,
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
                      ele._info_pu.onlinestatus == 1
                        ? "pointer"
                        : "not-allowed",
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
              title: this.$t('Monitor.channel') + i,
              id: ele._id_pu,
              disabled: ele._info_pu.onlinestatus != 1,
              render: (h, { root, node, data }) => {
                return h(
                  "span",
                  {
                    class: "span",
                    style: {
                      cursor:
                        ele._info_pu.onlinestatus == 1
                          ? "pointer"
                          : "not-allowed",
                      color: ele._info_pu.onlinestatus == 1 ? "initial" : "#ccc"
                    },
                    on: {
                      click: () => {
                        this.ShowVideo(ele,i)
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
          temp.push(data);
        });
        this.$set(this.Pu_List[0], "children", []);
        this.$set(this.Pu_List[0], "children", temp);
      } else {
        this.$set(this.Pu_List[0], "children", []);
      }
    },
    ShowVideo(ele,i) {
      if (ele._info_pu.onlinestatus != 1) return;
      let videoList = this.videoDivList.filter(el => el.chanel == undefined);
      if (videoList.length == 0) {
        // this.videoDivList[this.videoTarget].chanel.swClose();
        // this.videoDivList[this.videoTarget].chanel = undefined;
        this.$set(this.videoDivList[this.videoTarget],'chanel',undefined)
        videoList = this.videoDivList.filter(el => el.chanel == undefined);
      }
      videoList[0].chanel = this.$store.state.session.swGetPuChanel(ele._id_pu, i);

      var strVideoDivId = document.getElementById("video" + this.videoTarget);
      if (videoList[0].chanel) {
        var result = videoList[0].chanel.swOpenEx({
          ismuti: true,
          div: strVideoDivId,
          prototype: "auto", //rtmp > hls
          bovertcp: true,
          callback: (options, response, dlghandle) => {
            console.log(options, response, dlghandle);
            let type = videoList[0].chanel.swSrcType();
            console.log(type);
            let url = videoList[0].chanel.swGetUrl();
            console.log(url);
            strVideoDivId.firstChild.append("\t("+url.proto+")")
          }
        });
        strVideoDivId.firstChild.innerText =
          (ele._name_pu || ele._id_pu) + "_"+this.$t('Monitor.channel') + i;
        if (this.videoTarget == this.videoDivList.length-1) {
          this.videoTarget = 0;
        } else {
          this.videoTarget += 1;
        }
        if (result != jSW.RcCode.RC_CODE_S_OK) {
          alert("打开视频失败: " + result);
          if (this.videoTarget != 0) {
            this.videoTarget -= 1;
          }
        }
      } else {
        alert("没有该设备通道");
        if (this.videoTarget != 0) {
          this.videoTarget -= 1;
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
    videosize(val){
      this.videoDivList = [];
      this.videoTarget = 0;
      for(let i=0;i<this.videosize;i++){
        this.videoDivList.push({ id: "video"+i, chanel: undefined })
      }
    },
    // "$store.state.session._arr_pu"(val) {
    //   this.GetPu(this.isOnline ? 1 : 0);
    // },
    "$store.state.session._arr_pu_online"(val) {
      if (this.isOnline) {
        this.GetPu(1);
      }
    },
    isOnline(val) {
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
  created() {
    console.log(this.$store.state.session);
    this.$store.state.session.swGetPuList({status:1,page:0,page_size:0})
    this.$store.state.session.swAddCallBack("pulist", () => {
      // this.GetPu(this.isOnline ? 1 : 0);
      console.log('do')
      this.GetPu(1)
    });

    // console.log(this.$store.state.session)
  },
  mounted() {
    // console.log(this.$store.state.session)
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
    height: 750px;
    overflow: auto;
    .tree {

    }
    
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
  flex:1;
  background-color: rgb(47, 46, 56);
  padding: 0 0 40px 0;
  box-sizing: border-box;
  // display: flex;
  // flex-direction: column;
  ._video_content{
    flex: 1;
    display: flex;
    flex-direction: row;
  }
  ._video4{
    float: left;
    width: 50%;
    height: 50%
  }
  ._video9{
    float: left;
    width: 33.333%;
    height: 33.333%
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
      background-color: rgba(0,0,0,.0);
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
#right_bottom{
  position: fixed;
  bottom: 0;
  z-index: 0;
  width: 100%;
  padding: 0 20px 0 255px;
  height: 30px;
  background-color: rgb(47, 46, 56);
  .rb_left{
    height: 100%;
    float: left;

  }
  .rb_right{
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
  .ivu-select-dropdown{
    top:-99px!important;
  }
  .ivu-dropdown-menu{
    min-width: initial;
  }
}
</style>


