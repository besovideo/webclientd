<template>
  <div id="TermList" class="SchedulingList">
    <Input class="search" @on-search="TermSearch" v-model="Search" search clearable placeholder />
    <!-- <div class="showonline">
      <Checkbox class="cb" v-model="Cb_isOnline">{{$t('Monitor.Showonlyonlinedevices')}}</Checkbox>
    </div>-->
    <!-- 设备列表 -->
    <div class="TreeList">
      <el-tree
        v-loading="TreeLoading"
        :data="TermListData"
        :highlight-current="true"
        node-key="key"
        :indent="8"
        :default-expanded-keys="['0']"
        @node-click="HandleChannelClick"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>
            <i v-if="node.label==''" class="el-icon-s-data" style="padding-right:5px;"></i>
            <img
              v-if="data.isMeeting"
              :src="MeetingState"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
            />
            <img
              v-if="data.isPerson"
              :src=" data | Status"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
            />
            <span
              class="unselectable"
              @dblclick.stop.prevent="HandleTreeClick(data,node)"
              :style="{color:data.isOnline==0?'#ccc':'inherit',paddingLeft:10}"
            >{{ node.label }}</span>
            <span class="pu_id" v-if="data.isPerson">
              <!-- {{node.label==node.pu_id?"":`(${node.pu_id})`}} -->
              {{ (data.id==undefined) ?"":(data.id.slice(3).length>0?`(${data.id.slice(3)})`:"") }}
            </span>
          </span>
          <span style="float:right;display:inline-block" v-if="data.isMeeting">
            <img
              :src="liaotian"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
              @click.stop="LiaotianClick(data)"
            />
          </span>
          <!-- <span class="pu_id" v-if="data.isMeeting">
            {{ (data.id==undefined) ?"":`(${data.id.slice(5)})` }} 
          </span>-->
        </span>
      </el-tree>
    </div>
    <!-- 设备列表 -->

    <!-- 分页 -->
    <!-- <div class="Page">
      <el-pagination
        :current-page.sync="CurrentPage"
        :page-size="100"
        layout="prev, pager, next"
        :total="Total"
        :pager-count="5"
        @current-change="ChangePage"
      ></el-pagination>
    </div>-->
    <!-- 分页 -->
  </div>
</template>

<script>
import { mapState } from "vuex";
import Vue from "vue";
import IM from "@/components/Monitor/IM.vue";
export default {
  props: ["noShowChannel"],
  components: { IM },
  data() {
    return {
      MeetingState: require("@/assets/images/meeting.png"),
      Person0: require("@/assets/images/person0.png"),
      Person1: require("@/assets/images/person1.png"),
      Speak: require("@/assets/images/speak.png"),
      Listening: require("@/assets/images/listening.png"),
      Personexit: require("@/assets/images/Personexit.png"),
      liaotian: require("@/assets/images/liaotian.png"),
      TermGpsList: [],
      Cb_isOnline: true,
      TreeLoading: true,
      isFirst: true,
      NameSearch: "",
      NameSelect: "1",
      TypeSelect: "1",
      CurrentPage: 1,
      Total: undefined,
      Search: "",
      SearchStatus: undefined,
      TermListData: [
        {
          label: this.$t("Monitor.Meeting"),
          key: 0,
          children: [
            {
              label: "会议"
            }
          ]
        }
      ],
      layim: undefined,
      imsgtypes: {
        TEXT: 1,
        FACE: 2,
        GPS: 3,
        FILE: 4,
        PIC: 5,
        AUDIO: 6,
        VOICE: 8
      }
    };
  },
  methods: {
    ConfSendWords(list, group_id) {
      let datas = [];
      list.forEach(el => {
        var data = {
          iType: el.type,
          data: el.msg,
          nruid: "NRU_"
        };
        datas.push(data);
      });
      this.confSendMsg(datas, group_id);
    },
    confSendMsg(datas, group_id) {
      var confManager = this.session.swGetConfManager();
      var conf = confManager.swGetConfByConfId(group_id);
      if (conf) {
        var rc = conf.swConfIMSend({
          msgitems: datas,
          callback: (options, response) => {
            console.log("发送信息回调", options, response);
          },
          pcallback: () => {},
          tag: null
        });
      }
    },
    LiaotianClick(data) {
      // let _IM = Vue.extend(IM)
      // let im = new _IM({
      //   data:{
      //     target: data
      //   }
      // })
      // if(!document.querySelector("#IMParent")){
      //   let div = document.createElement("div")
      //   div.id = 'IMParent'
      //   document.body.appendChild(div)
      // }

      // im.vm = im.$mount('#IMParent')

      layui.use(["layim"], layim => {
        //先来个客服模式压压精
        layim.chat({
          name: data.label,
          type: "group", //群组类型
          avatar: "http://tp2.sinaimg.cn/5488749285/50/5719808192/1",
          id: data.id, //定义唯一的id方便你处理信息
          members: 123 //成员数，不好获取的话，可以设置为0
        });
      });
    },
    TermSearch(val, page) {},
    HandleChannelClick(data, node) {
      if (data.isTerm) {
        let channel = this.session.swGetPuChanel(data.pu_id, 65536);
        console.log(channel);
        this.$emit("on-term-click", channel);
        return;
      }

      if (data.$treeNodeId == 1) {
        return;
      }
      if (!data.isChannel) {
        return;
      }
      // this.ReloadContent = true;
      // this.ChannelContent = true
      let channel = this.session.swGetPuChanel(data.pu_id, data.index);
      this.$emit("on-click", channel, data.index);

      // if (data.index < channel._parent._arr_gps.length) {
      //   channel = channel._parent._arr_gps[data.index];
      // } else {
      //   channel = channel._parent._arr_gps[0];
      // }
      // console.log(channel);
      // channel.swOpen({
      //   callback: (options, response) => {
      //     let lat = response.gps.lat / 10000000;
      //     let long = response.gps.long / 10000000;
      //     this.ReloadContent = true;
      //     this.ChannelContent = true;
      //     this.position = [long, lat];
      //   }
      // });
    },
    HandleTreeClick(data, node, ele) {},
    ChangePage(page) {},
    SetMeetingData(data) {
      let temp = [];
      let gpsterm = new Set();
      data.forEach((ele, i) => {
        let children = [];

        if (ele._conf_particulars.length > 0) {
          ele._conf_particulars.forEach((el, i) => {
            if (el.id.indexOf("PU") != -1) {
              gpsterm.add(el.id);
            }
            children.push({
              label: el.aliasname || el.name,
              id: el.id,
              isPerson: true,
              addr: el.addr,
              pid: el.pid,
              isOnline: el.isonline,
              isadmin: el.isadmin,
              isinseat: el.isinseat,
              isleave: el.isleave,
              isSpeak: el.isSpeak
            });
          });
        }
        temp.push({
          label: ele._conf_base_info.name,
          id: ele._conf_base_info.id,
          isMeeting: true,
          children
        });
      });

      this.$set(this.TermListData[0], "children", []);
      this.$set(this.TermListData[0], "children", temp);
      this.TreeLoading = false;

      //获取设备GPS并显示
      gpsterm.forEach(el => {
        let gps = this.session.swGetPuChanel(el, 65536);
        if (gps == null) {
          return;
        }
        this.TermGpsList.push(gps);
      });
      this.$emit("on-get-termgps", this.TermGpsList);

      console.log(this.TermGpsList);
    },
    SetWatch(sender, event, data) {
      console.log(sender, event, data);
      switch (event) {
        case "notifybaseinfo":
          this.SetConfInfo(data.conf, data.data);
          break;
        case "notifyimmsg":
          this.GetMessage(data.conf, data.data);
          break;
        default:
          this.SetTermStatus(data.conf, data.data);
          break;
      }
    },
    GetMessage(conf, data) {
      var receivedata = data.szmsgs;
      if (receivedata.length > 1) {
        var itype = 1;
      } else {
        var itype = receivedata[0].iType;
      }

      let _data = [];

      switch (itype) {
        case this.imsgtypes.TEXT:
        case this.imsgtypes.FACE:
          for (i in receivedata) {
            _data.push(receivedata[i].szTextMsg);
          }
          var dataimg;
          var datainnerhtml;
          for (let ix in _data) {
            if (_data[ix].id) {
              // dataimg = "<img src="+data[ix].url +">";
              dataimg = "img[" + _data[ix].url + "]";
            } else {
              dataimg = _data[ix];
            }
            if (datainnerhtml) {
              datainnerhtml = datainnerhtml + dataimg;
            } else {
              datainnerhtml = dataimg;
            }
          }
          _data = datainnerhtml;
          break;
      }
      this.layim.getMessage({
        username: "未知", //消息来源用户名
        avatar: "http://tp1.sinaimg.cn/1571889140/180/40030060651/1", //消息来源用户头像
        id: data.confid, //消息的来源ID（如果是私聊，则是用户id，如果是群聊，则是群组id）
        type: "group", //聊天窗口来源类型，从发送消息传递的to里面获取
        content: _data, //消息内容
        cid: 0, //消息id，可不传。除非你要对消息进行一些操作（如撤回）
        mine: data.bismine, //是否我发送的消息，如果为true，则会显示在右方
        fromid: "100001", //消息的发送者id（比如群组中的某个消息发送者），可用于自动解决浏览器多窗口时的一些问题
        timestamp: new Date().getTime() //服务端时间戳毫秒数。注意：如果你返回的是标准的 unix 时间戳，记得要 *1000
      });
    },
    SetConfInfo(conf, data) {
      let Conf = this.TermListData[0].children.filter(el => el.id == data);
      if (Conf.length == 0) {
        return;
      }
      //修改会议名称
      Conf[0].label = conf._conf_base_info.name;
    },
    SetTermStatus(conf, data) {
      let Conf = this.TermListData[0].children.filter(
        el => el.id == conf._conf_base_info.id
      );
      if (Conf.length == 0) {
        return;
      }
      if (data.__proto__.constructor == Array) {
        data.forEach(el => {
          this.SetTermStatus(conf, el);
        });
        return;
      }
      let Term = Conf[0].children.filter(el => el.id == data.id);
      if (Term.length == 0) return;
      let temp = {
        label: data.aliasname || data.name,
        id: data.id,
        isPerson: true,
        addr: data.addr,
        pid: data.pid,
        isOnline: data.isonline,
        isadmin: data.isadmin,
        isinseat: data.isinseat,
        isleave: data.isleave,
        isSpeak: data.isSpeak
      };

      for (let obj in temp) {
        Term[0][obj] = temp[obj];
      }

      console.log("Over");
    },
    GetLayImGroup(list) {
      let mList = [];
      if (list.length == 0) {
        return mList;
      }

      list.forEach(el => {
        mList.push({
          groupname: el._conf_base_info.name, //群组名
          id: el._conf_base_info.id, //群组ID
          avatar: "http://tp2.sinaimg.cn/5488749285/50/5719808192/1" //群组头像
        });
      });
      return mList;
    },
    ConfEmoji() {
      var confManager = this.session.swGetConfManager();
      var rc = confManager.swGetImEmotions({
        callback: (options, response, data) => {
          if (response.emms.code == 0) {
            window.emojiarr = data;
          }
        },
        tag: null
      });
    },
    FilterEmoji(content) {
      let contentList = content.split(/(face\[\d+?\])/);
      let tempList = [];
      contentList.forEach(el => {
        if (el == "") {
          return;
        }
        if (el.startsWith("face")) {
          tempList.push({
            type: this.imsgtypes.FACE,
            msg: el.slice(5, -1)
          });
        } else {
          tempList.push({
            type: this.imsgtypes.TEXT,
            msg: el
          });
        }
      });
      return tempList;
    },
    UploadImage(file, id) {
      if (file.files.length == 0) {
        console.error("");
        return;
      }
      file.id = "images";
      var confManager = this.session.swGetConfManager();
      var conf = confManager.swGetConfByConfId(id);
      var myUsefulData = {
        target: file,
        id: "images"
      }; //用户数据，在回调中也把这个对象通知过来

      var msgItem = {
        iType: this.imsgtypes.PIC,
        data: file.files[0]
      };

      var rc = conf.swConfIMSend({
        msgitems: [msgItem],
        callback: (options,response) => {
          if (response.emms.code == jSW.RcCode.RC_CODE_S_OK) {
            console.log(options.tag.id, "上传成功");
          } else {
            console.log(options.tag.id, "上传失败");
          }
        },
        pcallback: () => {},
        tag: myUsefulData
      });

      if (rc == jSW.RcCode.RC_CODE_S_OK) {
        console.log("上传中");
      } else {
        console.log("上传失败");
      }
    }
  },
  filters: {
    Status: function(value) {
      if (!value.isOnline) {
        return require("@/assets/images/person0.png");
      }
      if (value.isSpeak) {
        return require("@/assets/images/speak.png");
      }
      if (value.isinseat) {
        return require("@/assets/images/listening.png");
      }
      if (value.isleave) {
        return require("@/assets/images/Personexit.png");
      }
      if (value.isOnline) {
        return require("@/assets/images/person1.png");
      }
    }
  },
  watch: {
    // Search(val) {
    //   if (val == "") {
    //     if (this.SearchStatus) {
    //       this.SearchStatus = false;
    //       this.GetTermList(0, 100, this.Cb_isOnline);
    //     }
    //   }
    // },
    Cb_isOnline(val) {
      if (!this.isFirst) {
        if (this.SearchStatus) {
          this.TermSearch(this.Search, 0);
        } else {
          this.GetTermList(0, 100, val);
        }
      }
    }
  },
  computed: {
    ...mapState({
      session: "session"
    })
  },

  created() {
    console.log("SchedulingTreeList,created");
    console.log(this.Personexit);

    let SwConfManager = this.session.swGetConfManager();
    SwConfManager.swInit({
      callback: code => {
        console.log("会议初始化:", code);
        let list = SwConfManager.swGetConfList();
        console.log("会议列表", list);
        this.SetMeetingData(list);
        SwConfManager.swRegConfWatch((sender, event, data) => {
          this.SetWatch(sender, event, data);
        });

        //初始化表情
        this.ConfEmoji();

        let mList = this.GetLayImGroup(list);
        layui.use(["layim"], layim => {
          this.layim = layim;
          layim.config({
            brief: false, //是否简约模式（如果true则不显示主面板）
            title: "IM聊天",
            init: {
              mine: {
                username: this.session._user, //我的昵称
                id: "100000", //我的ID
                status: "online", //在线状态 online：在线、hide：隐身
                sign: "", //我的签名
                avatar: this.Person1 //我的头像
              },
              group: mList
            },
            uploadImage: {
              url: "", //接口地址
              type: "post" //默认post
            },
            //上传文件接口（返回的数据格式见下文），若不开启文件上传，剔除该项即可
            uploadFile: {
              url: "", //接口地址
              type: "post" //默认post
            },
            isAudio: true
          });

          layim.on("sendMessage", res => {
            var mine = res.mine; //包含我发送的消息及我的信息
            var to = res.to; //对方的信息
            console.log(res.mine);
            if (to.type == "group") {
              this.ConfSendWords(this.FilterEmoji(mine.content), to.id);
            }
            console.log(mine, to);
            return false;
          });

          layim.on("uploadImage", (data, info, callback) => {
            console.log(info);
            data.onchange = e => {
              this.UploadImage(e.target, info.id);
              callback();
            };
          });
        });
      }
    });
  }
};
</script>

<style lang="less">
.SchedulingList {
  .TreeList {
    height: calc(100% - 38px) !important;
  }
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.layim-send-voice {
  cursor: pointer;
  color: #fff;
  position: absolute;
  width: 100px;
  top: 3px;
  height: 32px;
  transform: translateX(-50%);
  left: 50%;
  background-color: #5fb878;
  border-radius: 3px;
  text-align: center;
  line-height: 32px;
}
.layim-send-voice:active {
  background-color: rgb(3, 31, 11);
}
</style>

