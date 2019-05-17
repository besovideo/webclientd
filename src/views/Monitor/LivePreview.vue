<template>
  <div class="body">
    <div class="body_left">
      <Tabs type="card" name="list" key="list" :value="tabs" id="list" :animated="false">
        <TabPane label="组织单元" name="tissue" tab="list">
          <Input class="search" search clearable placeholder/>
          <div class="showonline">
            <Checkbox class="cb" v-model="isOnline">只显示在线设备</Checkbox>
          </div>
          <div class="list">
            <Tree :data="Pu_List" :load-data="loadData" multiple></Tree>
          </div>
        </TabPane>
        <TabPane label="我的收藏" name="Collection" tab="list"></TabPane>
      </Tabs>

      
    </div>
    <div id="right_content">
      <!-- <video-player ref="videoPlayer" style="vertical-align:top" :options="playerOptions"></video-player> -->
      <div class="_video" id="video0">
        <div class="title"></div>
        <div class="bottom">
          <div class="right">
            <!-- <img src="../../assets/images/full_screen.png" alt="" width="25"> -->
            <Icon custom="fa fa-arrows-alt" size='20' style="line-height:25px" @click="FullScreen()"/>
          </div>
        </div>
      </div>  
      <div class="_video" id="video1">
        <div class="title"></div>
      </div>  
      <div class="_video" id="video2">
        <div class="title"></div>
      </div>  
      <div class="_video" id="video3">
        <div class="title"></div>
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
        height: '500',
        controls: false,
        autoplay: true,
        sources:[]
      },
      onlineImgUrl: require('../../assets/images/online.png'),
      OfflineImgUrl: require('../../assets/images/Offline.png'),
      videoDivList: [{'id':'video1',chanel:undefined},{'id':'video2',chanel:undefined},{'id':'video3',chanel:undefined},{'id':'video4',chanel:undefined}],
      videoTarget: 0,
      Pu_List: [
        {
          title: "服务器",
          expand: true,
          render: (h, { root, node, data }) => {
            return h(
              "span",
              {
                style: {
                  display: "inline-block",
                  width: "100%",
                  marginLeft: "4px"
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
    FullScreen(e){
      
      let videoEl = event.target.parentElement.parentElement.parentElement;
      console.log(videoEl.dataset['isfullscreen']);
      
      if(videoEl.dataset['isfullscreen']=='false'||videoEl.dataset['isfullscreen']==undefined){
        if(!videoEl)return
        this.$tools.launchIntoFullscreen(videoEl)
        videoEl.dataset['isfullscreen'] = true
      }else{
        this.$tools.exitFullscreen(videoEl)
        videoEl.dataset['isfullscreen'] = false
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
    SetList(name){
      if (this.$store.state.session[name].length > 0) {
        let temp = [];
        this.$store.state.session[name].forEach(ele => {
          let data = {
            title: ele._name_pu||ele._id_pu,
            expand: false,
            disabled: ele._info_pu.onlinestatus!=1,
            render: (h, { root, node, data }) => {
              data.disabled = ele._info_pu.onlinestatus!=1;
              let url = ele._info_pu.onlinestatus==1?this.onlineImgUrl:this.OfflineImgUrl
              return h("span",{class:'PUName_ID',style:{
                cursor: ele._info_pu.onlinestatus==1?'pointer':'not-allowed',
                color: ele._info_pu.onlinestatus==1?'initial':'#ccc'
              },
                on:{click:()=>{
                  if(ele._info_pu.onlinestatus!=1){
                    data.expand = false
                    return
                  }
                  if(ele._info_pu.onlinestatus==1){
                    data.expand = !data.expand
                  }
                }}
              },[h('img',{
                domProps:{
                  src: url,
                  width: 22
                },
                style:{
                  width: '22px',
                  height: '22px',
                  verticalAlign: 'top',
                  margin: '0 5px' 
                }
              }),h('span',data.title)])
            },
            children: []
          };
            ele._arr_channel.forEach((el, i) => {
              
              data.children.push({
                title: "通道" + i,
                id: ele._id_pu,
                disabled: ele._info_pu.onlinestatus!=1,
                render: (h, { root, node, data }) => {
                  return h(
                    "span",
                    {
                      class: "span",
                      style: {
                        cursor: ele._info_pu.onlinestatus==1?'pointer':'not-allowed',
                        color: ele._info_pu.onlinestatus==1?'initial':'#ccc'
                      },
                      on: {
                        click: () => {
                          if(ele._info_pu.onlinestatus!=1)return
                          let videoList = this.videoDivList.filter(el=>el.chanel==undefined)
                          if(videoList.length==0){
                            this.videoDivList[this.videoTarget].chanel.swClose();
                            this.videoDivList[this.videoTarget].chanel = undefined;
                            videoList = this.videoDivList.filter(el=>el.chanel==undefined)
                          }
                          videoList[0].chanel = this.$store.state.session.swGetPuChanel(
                            data.id,
                            i
                          );

                          var strVideoDivId = document.getElementById(
                            "video"+this.videoTarget
                          );
                          if (videoList[0].chanel) {
                            var result = videoList[0].chanel.swOpenEx({
                              ismuti: true,
                              div: strVideoDivId,
                              prototype: "auto", //rtmp > hls
                              bovertcp: true,
                              callback: (options, response, dlghandle) => {
                                console.log(options,response,dlghandle)
                                
                                let url = videoList[0].chanel.swGetUrl();
                                console.log(url);
                                
                              
                              }
                            });
                            strVideoDivId.firstChild.innerText = (ele._name_pu||ele._id_pu) + "_通道" +i 
                            if(this.videoTarget==3){
                                this.videoTarget=0
                              }else{
                                this.videoTarget+=1
                            }
                            if (result != jSW.RcCode.RC_CODE_S_OK) {
                              alert("打开视频失败: " + result);
                              if(this.videoTarget!=0){
                                this.videoTarget-=1
                              }
                              
                            }
                          } else {
                            alert("没有该设备通道");
                            if(this.videoTarget!=0){
                                this.videoTarget-=1
                              }
                          }
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
            })
          temp.push(data);
        });
        this.$set(this.Pu_List[0],'children',[])
        this.$set(this.Pu_List[0],'children',temp)
      }
    },
    GetPu(status){
      if(status==1){
       this.SetList('_arr_pu_online')
      }else{
       this.SetList('_arr_pu')
      }
    }
  },
  watch: {
    tabs(val) {
      console.log(val);
    },
    "$store.state.session._arr_pu"(val){
      this.GetPu(this.isOnline?1:0)
    },
    
    isOnline(val){
      if(val){
        this.GetPu(1)
      }else{
        this.GetPu(0)
      }
    }
  },

  computed: {
    GetSession: () => {
      return this.$store.state.session;
    },
    player() {
        return this.$refs.videoPlayer.player
    }
  },
  created() {    
    this.GetPu(0)
    console.log(this.$store.state.session)
    this.$store.state.session.swAddCallBack("pulist", () => {
      this.GetPu(this.isOnline?1:0)
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
}
.body_left {
  // position: fixed;
  float: left;
  background-color: #fff;
  z-index: 2;
  width: 250px;
  height: 100%;
  .search {
    margin: -10px 0 6px 0;
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
    margin-left: 10px;
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
  background-color: rgb(47, 46, 56);
  padding:0 0 52px 250px;
  box-sizing: border-box;
  
  ._video{
    float: left;
    width: 50%;
    height: 50%;
    position: relative; 
    border: 1px solid rgb(33, 41, 51);
    &:hover{
      border: 1px solid rgb(72, 123, 194);
    }
    .title{
      width: 100%;
      padding-left: 20px;
      position: absolute;
      top: 0;
      z-index: 10;
      line-height: 30px;
      font-size: 16px;
      color: #fff;
      background-color: #000;
    }
    &:hover .bottom{
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
      .right{
        float: right;
        padding: 0 5px 0 0 ;
        height: 100%;
        .fa {
          line-height: 25px;
          cursor: pointer;
          &:hover{
            color: rgb(52, 99, 165)
          }
        }
      }
    }
  }
}
.span {
  cursor: pointer;
  padding: 4px 4px;
  &:hover {
    background-color: #d5e8fc;
  }
}
.PUName_ID{
  cursor: pointer;
}
</style>


