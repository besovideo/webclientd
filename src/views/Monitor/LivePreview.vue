<template>
  <div class="body">
    <div class="body_left">
      <Tabs type="card" name="list" key="list" :value="tabs" id="list" :animated="false">
        <TabPane label="组织单元" name="tissue" tab="list"></TabPane>
        <TabPane label="我的收藏" name="Collection" tab="list"></TabPane>
      </Tabs>

      <Input class="search" search clearable placeholder/>
      <div class="showonline">
        <Checkbox class="cb" v-model="isOnline">只显示在线设备</Checkbox>
      </div>
      <div class="list">
        <Tree :data="Pu_List" :load-data="loadData" multiple></Tree>
      </div>
    </div>
    <div id="right_content">
      <video-player ref="videoPlayer" style="vertical-align:top" :options="playerOptions"></video-player>
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
    }
  },
  watch: {
    tabs(val) {
      console.log(val);
    },
    "$store.state.session": val => {
      console.log(this.data4);
      if (val != undefined) {
        this.session = val;
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
    // console.log(this.$store.state.session._arr_pu)
    // if (this.$store.state.session._arr_pu.length > 0) {
    //     this.$store.state.session._arr_pu.forEach(ele => {
    //       this.Pu_List[0].children.push({
    //         title: ele._id_pu,
    //         // loading: false,
    //         children: []
    //       });
    //     });
    //   }
    this.$store.state.session.swAddCallBack("pulist", () => {
      if (this.$store.state.session._arr_pu.length > 0) {
        this.$store.state.session._arr_pu.forEach(ele => {
          let data = {
            title: ele._id_pu,
            // loading: false,
            children: []
          };
          ele._arr_channel.forEach((el, i) => {
            data.children.push({
              title: "通道" + i,
              id: ele._id_pu,
              render: (h, { root, node, data }) => {
                return h(
                  "span",
                  {
                    class: "span",
                    on: {
                      click: () => {
                        this.$store.state.session.swGetPuChanel(
                          data.id,
                          i
                        ).swClose();
                        var chanel = this.$store.state.session.swGetPuChanel(
                          data.id,
                          i
                        );
                        var strVideoDivId = document.getElementById(
                          "right_content"
                        );
                        if (chanel) {
                          var result = chanel.swOpenEx({
                            // div: strVideoDivId,
                            prototype: "auto", //rtmp > hls
                            bovertcp: true,
                            callback: (options, response) => {
                              console.log(options,response)
                              var url = chanel.swGetUrl();
                              console.log(url);
                              this.$set(this.playerOptions,'sources',[{
                                  type: 'application/x-mpegURL',
                                  src: 'http://'+url.url
                                }])
                            }
                          });

                          if (result != jSW.RcCode.RC_CODE_S_OK) {
                            alert("打开视频失败: " + result);
                          }
                        } else {
                          alert("没有该设备通道");
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
          });
          this.Pu_List[0].children.push(data);
        });
      }
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
  position: fixed;
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
  position: fixed;
  height: 100%;
  width: 100%;
  margin-left: 250px;
}
.span {
  cursor: pointer;
  padding: 4px 4px;
  &:hover {
    background-color: #d5e8fc;
  }
}
</style>


