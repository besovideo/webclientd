<template>
  <div id="TermList" class="SchedulingList">
    <!-- <Input class="search" @on-search="TermSearch" v-model="Search" search clearable placeholder /> -->
    <!-- <div class="showonline">
      <Checkbox class="cb" v-model="Cb_isOnline">{{$t('Monitor.Showonlyonlinedevices')}}</Checkbox>
    </div>-->
    <!-- 设备列表 -->
    <div class="TreeList">
      <el-tree
        v-loading="TreeLoading"
        :data="TermListData"
        :highlight-current="true"
        :expand-on-click-node="false"
        node-key="key"
        ref="SchedulingTree"
        @node-expand="HandleChannelClick"
        :indent="8"
        accordion
        :default-expanded-keys="TreeExpanded"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }" rightMenu>
          <span :title="data.bIsStarted==true?'':(data.isMeeting && $t('Data.huiyiweikaishi'))">
            <i v-if="data.isMeeting" :class="data.bIsStarted ? 'el-icon-success':'el-icon-error'" style="padding-right:5px;"></i>
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
              v-if="data.root"
            >{{ node.label }}</span>
            <span
              class="unselectable"
              v-if="data.isMeeting"
            >{{ node.label }}</span>

            <el-dropdown trigger="click" v-if="data.isPerson" size="medium" @command="MenuHandle">
              <span
                class="unselectable"
                :style="{color:data.isOnline==0?'#ccc':'inherit',paddingLeft:10}"
              >{{ node.label }}</span>
              <el-dropdown-menu slot="dropdown" v-if="node.parent.data.UserIsAdmin">
                <el-dropdown-item icon="el-icon-microphone" :disabled="!data.isOnline" :command="{type:'InviteSpeak',val:[node,data]}">{{$t('Data.dianmingfayan')}}</el-dropdown-item>
                <el-dropdown-item icon="el-icon-turn-off-microphone" :disabled="!data.isOnline" :command="{type:'StopSpeak',val:[node,data]}">{{$t('Data.zhongzhifayan')}}</el-dropdown-item>
                <el-dropdown-item icon="el-icon-close" :disabled="data.isadmin" :command="{type:'deletePerson',val:[node,data]}">{{$t('Data.shanchuchengyuan')}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <span class="pu_id" v-if="data.isPerson">
              <!-- {{node.label==node.pu_id?"":`(${node.pu_id})`}} -->
              {{ (data.id==undefined) ?"":(data.id.slice(3).length>0?`(${data.id.slice(3)})`:"") }} {{data.isadmin?$t('Data.guanliyuan'):''}}
            </span>
          </span>

          <span style="float:right;display:inline-block" v-if="data.isMeeting">
            <el-dropdown trigger="click" size="medium" @command="MenuHandle">    
              <img
                :src="require('@/assets/images/PersonSet.png')"
                width="15"
                height="15"
                style="display:block;float: left;margin:3px 5px 0 0 ;"
                alt
                @click.stop="a = 1"
              />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-zoom-in" :command="{type:'invaiteJoin',val:data}">{{$t('Data.yaoqingjiaru')}}</el-dropdown-item>
                <el-dropdown-item icon="el-icon-success" :command="{type:'startMeet',val:data}">{{$t('Data.kaishihuiyi')}}</el-dropdown-item>
                <el-dropdown-item icon="el-icon-error" :command="{type:'stopMeet',val:data}">{{$t('Data.jieshuhuiyi')}}</el-dropdown-item>
                <el-dropdown-item icon="el-icon-close" :command="{type:'deleteMeet',val:data}">{{$t('Data.shanchuhuiyi')}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <!-- <img
              :src="require('@/assets/images/stopfayan.png')"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
              @click.stop="stopSpeak(data)"
            /> -->
            <img
              :src="require('@/assets/images/fayan.png')"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
              @mousedown="startSpeak(data)"
              @mouseup="stopSpeak(data)"
            />

            <img
              :src="liaotian"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
              @click.stop="LiaotianClick(data)"
            />
            
          </span>
          <span style="float:right;display:inline-block" v-if="data.root">
            <el-dropdown trigger="click" size="medium" @command="MenuHandle">
              <img
                :src="require('@/assets/images/MeetSet.png')"
                width="15"
                height="15"
                style="display:block;float: left;margin:3px 5px 0 0 ;outline: none"
                @click.stop="MeetSetShow = true"
                alt
              />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item icon="el-icon-plus" :command="{type:'create'}">{{$t('Data.chuangjianhuiyi')}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            
          </span>
          <!-- <span class="pu_id" v-if="data.isMeeting">
            {{ (data.id==undefined) ?"":`(${data.id.slice(5)})` }} 
          </span>-->
        </span>
      </el-tree>
    </div>
    <!-- 设备列表 -->

  <!-- 创建会议 -->
    <el-dialog
      :title="$t('Data.chuangjianhuiyi')"
      :visible.sync="CreateDialog"
      :width="lang=='en'?'900px':'700px'"
      
      :before-close="HandleDialogClose"
      center >
      <el-form :model="CreateForm" :rules="CreateRules" ref="CreateForm" :label-width="lang=='en'?'140px':'90px'" size="medium">
        <el-form-item :label="$t('Data.huiyimingcheng')" prop="name">
          <el-input v-model="CreateForm.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Data.qunzuleixing')" prop="type">
          <el-radio-group v-model="CreateForm.type" size="medium">
            <el-radio border :label="jSW.SwConfManager.MODE_SPEAK.CHAIRMAN">{{$t('Data.zhuchirenmoshi')}}</el-radio>
            <el-radio border :label="jSW.SwConfManager.MODE_SPEAK.DISCUSSIONGROUP">{{$t('Data.taolunzumoshi')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('Data.jiarufangshi')" prop="JoinMode">
          <el-radio-group v-model="CreateForm.JoinMode" size="medium">
            <el-radio border :label="jSW.SwConfManager.MODE_JOIN.INVITE">{{$t('Data.yaoqingjiaru')}}</el-radio>
            <el-radio border :label="jSW.SwConfManager.MODE_JOIN.PASSWORD">{{$t('Data.shurumimajiaru')}}</el-radio>
            <el-radio border :label="jSW.SwConfManager.MODE_JOIN.FREE">{{$t('Data.wumimajiaru')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('Data.mima')" v-if="CreateForm.JoinMode == '8' " prop="pass">
          <el-input type="password" v-model="CreateForm.pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Data.querenmima')" v-if="CreateForm.JoinMode == '8' " prop="checkPass">
          <el-input type="password" v-model="CreateForm.checkPass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('Data.fayanshenqing')" prop="ApplyFor">
          <el-radio-group v-model="CreateForm.ApplyFor" size="medium">
            <el-radio border :label="jSW.SwConfManager.MODE_APPLY.AUTOAGREE">{{$t('Data.zidongtongyi')}}</el-radio>
            <el-radio border :label="jSW.SwConfManager.MODE_APPLY.NEEDAGREE">{{$t('Data.guanliyuanxuke')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('Data.kaishimoshi')" prop="StartMode">
          <el-radio-group v-model="CreateForm.StartMode" size="medium">
            <el-radio border :label="jSW.SwConfManager.MODE_START.STOPADMIN">{{$t('Data.guanliyuankaiqi')}}</el-radio>
            <el-radio border :label="jSW.SwConfManager.MODE_START.FOREVER">{{$t('Data.zidongkaiqi,buyunxuzanting')}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="CreateDialog = false">{{$t('Data.quxiao')}}</el-button>
        <el-button type="primary" @click="DoCreateConfClick">{{$t('Data.queren')}}</el-button>
      </span>
    </el-dialog>
  <!-- 创建会议 -->

    <!-- 邀请加入会议 -->
    <el-dialog
      :title="$t('Data.yaoqingjiaru')"
      :visible.sync="InvaiteDialog"
      class="InvaiteDialog"
      width="600px"
      :before-close="HandleDialogClose"
      center >
      <el-divider content-position="left">{{$t('Data.zaixianyonghu')}}</el-divider>
        <el-checkbox-group v-model="CheckBoxOnlineJoin.data" size="mini" >
          <el-checkbox :label="item" border v-for="item in OnlineUserList" :title="'id: '+item.id" :key="item.applierid||item.id">{{ item.name || item.id }}</el-checkbox>
        </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="InvaiteDialog = false">{{$t('Data.quxiao')}}</el-button>
        <el-button type="primary" @click="DoInvaiteJoinClick">{{$t('Data.queren')}}</el-button>
      </span>
    </el-dialog>
    <!-- 邀请加入会议 -->

    <!-- 发起语音 -->
    <div class="speak_fixed">
      <p style="height: 50%;line-height:25px;font-size:14px;padding-left:10px">{{$t('Data.dangqianhuiyi')}} <span>{{this.NowSpeakConf}}</span></p> 
      <!-- <p style="height: 50%;line-height:25px;font-size:14px;padding-left:10px">{{$t('Data.zhengzaifayan')}} <span>{{this.NowSpeaker == this.user ? $t('Data.dangqianyonghu'): this.NowSpeaker}}</span></p>  -->
      <p style="height: 50%;line-height:25px;font-size:14px;padding-left:10px">{{$t('Data.zhengzaifayan')}} <span>{{this.NowSpeaker}}</span></p> 
    </div>
    <!-- 发起语音 -->
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
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('Data.qingshurumima')));
      } else {
        if (this.CreateForm.checkPass !== '') {
          this.$refs.CreateForm.validateField('checkPass');
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('Data.qingzaicishurumima')));
      } else if (value !== this.CreateForm.pass) {
        callback(new Error(this.$t('Data.liangcishurumimabuyizhi')));
      } else {
        callback();
      }
    };
    return {
      MeetingState: require("@/assets/images/meeting.png"),
      Person0: require("@/assets/images/person0.png"),
      Person1: require("@/assets/images/person1.png"),
      Speak: require("@/assets/images/speak.png"),
      Listening: require("@/assets/images/listening.png"),
      Personexit: require("@/assets/images/Personexit.png"),
      liaotian: require("@/assets/images/liaotian.png"),
      NowSpeaker:'',
      NowSpeakConf:'',
      TreeExpanded: [0],
      TermGpsList: [],
      jSW: undefined,
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
          root: true,
          key: 0,
          children: [
            {
              label: "会议",
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
      },
      MeetSetShow:false,
      CreateDialog:false,
      CreateForm:{
        name: '',
        type: jSW.SwConfManager.MODE_SPEAK.CHAIRMAN,
        JoinMode: jSW.SwConfManager.MODE_JOIN.INVITE,
        ApplyFor: jSW.SwConfManager.MODE_APPLY.AUTOAGREE,
        StartMode: jSW.SwConfManager.MODE_START.STOPADMIN,
        pass: '',
        checkPass:''
      },
      CreateRules:{
        name:[
          { required: true, message: this.$t('Data.qingshuruhuiyimingcheng'), trigger: 'blur' }
        ],
        type:[
          { required: true, message: this.$t('Data.qingxuanze'), trigger: 'blur' }
        ],
        JoinMode:[
          { required: true, message: this.$t('Data.qingxuanze'), trigger: 'blur' }
        ],
        ApplyFor:[
          { required: true, message: this.$t('Data.qingxuanze'), trigger: 'blur' }
        ],
        StartMode:[
          { required: true, message: this.$t('Data.qingxuanze'), trigger: 'blur' }
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' },
          { required: true, message: this.$t('Data.qingshurumima'), trigger: 'blur' },
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' },
          { required: true, message: this.$t('Data.qingzaicishurumima'), trigger: 'blur' },
        ],
      },
      InvaiteDialog:false,
      CheckBoxOnlineJoin:{data:[],id:undefined},
      OnlineUserList: [],
      SpeakNotify: []
    };
  },
  methods: {
    startSpeak(data){
      if(!data.bIsStarted){
        this.$Message.error(this.$t('Data.huiyiweikaishi'))
        return
      }
      var confManager = this.session.swGetConfManager();
        var conf = confManager.swGetConfByConfId(data.id);
        if (conf == null) {
            console.warn("会议不存在");
            return;
        }


        let rc = conf.swApplyForSpeak({
            callback:  (sender, event, json) => {
              if(event.emms.code!=0){
                this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                return
              }
            }
        });
        console.log(rc)
    },
    stopSpeak(data){
      var confManager = this.session.swGetConfManager();
        var conf = confManager.swGetConfByConfId(data.id);
        if (conf == null) {
            console.warn("会议不存在");
            return;
        }
        conf.swApplyForEndSpeak({
            callback: function (sender, event, json) {

            }
        });
    },
    HandleDialogClose(done){
      this.$confirm(this.$t('Data.querenguanbi')+"?",{
        confirmButtonText: this.$t('Data.queren'),
        cancelButtonText: this.$t('Data.quxiao'),
      })
        .then(_ => {
          done();
        })
        .catch(_ => {})
    },
    _DOCreateConf(cb) {
      this.$store.state.ErrorCode = this.session.swGetConfManager().swCreateConf({
            confbaseinfo: {
                name: this.CreateForm.name,
                speakmode: parseInt(this.CreateForm.type),
                joinmode: parseInt(this.CreateForm.JoinMode),
                applyformode: parseInt(this.CreateForm.ApplyFor),
                startmode: parseInt(this.CreateForm.StartMode),
                password: this.CreateForm.checkPass
            },
            callback:  (sender, event, json) => {
                this.$store.state.ErrorCode = event.emms.code
                if(event.emms.code!=0){
                  this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                  return
                }
                // this.SetMeetingData(this.session.swGetConfManager().swGetConfList());
                this.CreateDialog = false
                this.$Message.success(this.$t('Data.chuangjianhuiyichenggong'))
            }
        });
    },
    DoCreateConfClick(){
      this.$refs['CreateForm'].validate((valid) => {
          if (valid) {
            this._DOCreateConf()
          } else {
            
            return false;
          }
        });
    },
    DoDeleteMeet(data){
      this.$confirm(`${this.$t('Data.cicaozuojiangshanchu')} ${data.label} (${data.id.slice(5)}) ${this.$t('Data.huiyi')}`, this.$t('Data.jinggao'), {
          confirmButtonText: this.$t('Data.queren'),
          cancelButtonText: this.$t('Data.quxiao'),
          type: 'warning',
          center: true
        }).then(() => {
          this.session.swGetConfManager().swDeleteConf({
            confid: data.id,
            callback: (sender, event, json) => {
              this.$store.state.ErrorCode = event.emms.code
              if(event.emms.code!=0){
                this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                return
              }
              // this.SetMeetingData(this.session.swGetConfManager().swGetConfList());
              this.$Message.success(this.$t('Data.shanchuchenggong'))
            }
        });
        }).catch(() => {
          
        });
    },
    DoDeletePerson(data){
      this.$confirm(`${this.$t('Data.cicaozuojiangshanchu')} ${data[1].label} (${data[1].id.slice(3)}) ${this.$t('Data.chengyuan')}`, this.$t('Data.jinggao'), {
          confirmButtonText: this.$t('Data.queren'),
          cancelButtonText: this.$t('Data.quxiao'),
          type: 'warning',
          center: true
        }).then(() => {
          let confManager = this.session.swGetConfManager();
          let conf = confManager.swGetConfByConfId(data[0].parent.data.id);
          if (conf == null) {
              this.$Message.error(this.$t('Data.huiyibucunzai'))
              return;
          }

          conf.swGetParticularList({
              callback: (options, response, particularList) => {
                  if (particularList.length > 0) {
                      conf.swParticipatorRemove({
                          users: particularList.filter(el => el.name == data[1].name),
                          callback:  (sender, event, json) => {
                            this.$store.state.ErrorCode = event.emms.code
                            if(event.emms.code!=0){
                              this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                              return
                            }
                            // this.SetMeetingData(this.session.swGetConfManager().swGetConfList());
                            this.$Message.success(this.$t('Data.shanchuchenggong'))
                          }
                      });
                  }
              },
              tag: null
          });
        }).catch(() => {
          
        });
    },
    DoInviteSpeak(data){
      
      let confManager = this.session.swGetConfManager();
      let conf = confManager.swGetConfByConfId(data[0].parent.data.id);
      if (conf == null) {
          this.$Message.error(this.$t('Data.huiyibucunzai'))
          return;
      }
      conf.swGetParticularList({
          callback: (options, response, particularList) => {
              if (particularList.length > 0) {
                  conf.swInviteSpeak({
                      user: particularList.filter(el => el.name == data[1].name)[0],
                      callback:  (sender, event) => {
                        this.$store.state.ErrorCode = event.emms.code
                        if(event.emms.code!=0){
                          this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                          return
                        }
                        this.$Message.success(this.$t('Data.dianmingfayan')+this.$t('Data.chenggong'))
                      }
                  });
              }
          },
          tag: null
      });
        
    },
    DoStopSpeak(data){
      
      let confManager = this.session.swGetConfManager();
      let conf = confManager.swGetConfByConfId(data[0].parent.data.id);
      if (conf == null) {
          this.$Message.error(this.$t('Data.huiyibucunzai'))
          return;
      }
      conf.swGetParticularList({
          callback: (options, response, particularList) => {
              if (particularList.length > 0) {
                  conf.swTerminalSpeak({
                      user: particularList.filter(el => el.name == data[1].name)[0],
                      callback:  (sender, event) => {
                        this.$store.state.ErrorCode = event.emms.code
                        if(event.emms.code!=0){
                          this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                          return
                        }
                        this.$Message.success(this.$t('Data.zhongzhifayan')+this.$t('Data.chenggong'))
                      }
                  });
              }
          },
          tag: null
      });
        
    },
    DoInvaiteJoinClick(){
      if(this.CheckBoxOnlineJoin.data.length==0){
        this.$Message.error(this.$t('Data.qingxuanzeyigeyonghu'))
        return
      }
      let confManager = this.session.swGetConfManager();
      let conf = confManager.swGetConfByConfId(this.CheckBoxOnlineJoin.id);
      if (conf == null) {
          this.$Message.error(this.$t("Data.huiyibucunzai"))
          return;
      }

      conf.swGetParticularList({
          callback: (options, response, particularList) => {
              if (particularList.length > 0) {
                  conf.swParticipatorAdd({
                      users: this.CheckBoxOnlineJoin.data,
                      callback:  (sender, event, json) => {
                        this.$store.state.ErrorCode = event.emms.code
                        if(event.emms.code!=0){
                          this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                          return
                        }
                        // this.SetMeetingData(this.session.swGetConfManager().swGetConfList());
                        this.InvaiteDialog = false
                        this.$Message.success(this.$t('Data.yaoqingchenggong'))
                      }
                  });
              }
          },
          tag: null
      });
    },
    MenuHandle(data) {
      console.log(data)
      let type = data.type
      switch (type) {
        case 'create':
          this.CreateForm = {
            name: '',
            type: jSW.SwConfManager.MODE_SPEAK.CHAIRMAN,
            JoinMode: jSW.SwConfManager.MODE_JOIN.INVITE,
            ApplyFor: jSW.SwConfManager.MODE_APPLY.AUTOAGREE,
            StartMode: jSW.SwConfManager.MODE_START.STOPADMIN,
            pass: '',
            checkPass:''
          }
          this.CreateDialog = true
        break
        case 'deleteMeet':
          this.DoDeleteMeet(data.val)
        break
        case 'startMeet': 
          var confManager = this.session.swGetConfManager();

          var conf = confManager.swGetConfByConfId(data.val.id);
          if (conf == null) {
              console.warn("会议不存在");
              return;
          }

          conf.swConfStart({
              callback:  (sender, event, json) => {
                if(event.emms.code!=0){
                    return
                }
                conf.swParticipatorReturn({
                  callback:  (sender, response, json) => {
                    if(event.emms.code!=0){
                      return
                    }
                    this.$refs.SchedulingTree.store.nodesMap[data.val.id].expanded = true
                  }
                });
                data.val.bIsStarted = true
              }
          });
        break
        case 'stopMeet':
          var confManager = this.session.swGetConfManager();
          var conf = confManager.swGetConfByConfId(data.val.id);
          if (conf == null) {
              console.warn("会议不存在");
              return;
          }
          conf.swConfStop({
              callback:  (sender, event, json) => {
                  if(event.emms.code!=0){
                    return
                  }
                this.$refs.SchedulingTree.store.nodesMap[data.val.id].expanded = false
              }
          });
        break
        case 'deletePerson':
          this.DoDeletePerson(data.val)
        break
        case 'invaiteJoin':
          this.session.swGetConfManager().swGetConfByConfId(data.val.id).swGetOnlineUsers({
            callback:(options,response,users)=>{
              this.$store.state.ErrorCode = response.emms.code
              if(response.emms.code!=0){
                this.$Message.error(this.$tools.findErrorCode(event.emms.code))
                return
              }
              this.OnlineUserList = users
              this.CheckBoxOnlineJoin.data = []
              this.CheckBoxOnlineJoin.id = data.val.id              
              this.InvaiteDialog = true
            }
          })
          // this.session.swSearchPuList({
          //   iPosition: 0,
          //   iCount: 200,
          //   stFilter: {
          //     iOnlineStatus: 1
          //   },
          //   callback: (event,response,data) =>{
          //     this.$store.state.ErrorCode = response.emms.code
          //     if(response.emms.code!=0){
          //       this.$Message.error(this.$tools.findErrorCode(event.emms.code))
          //       return
          //     }
          //   }
          // })
        break
        case 'InviteSpeak':
          this.DoInviteSpeak(data.val)
        break
        case 'StopSpeak':
          this.DoStopSpeak(data.val)
        break
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
          try {
            layim.chat({
              name: data.label,
              type: "group", //群组类型
              avatar: "http://tp2.sinaimg.cn/5488749285/50/5719808192/1",
              id: data.id, //定义唯一的id方便你处理信息
              members: 123 //成员数，不好获取的话，可以设置为0
            });
          } catch {
            console.log("error==============")
          }
        });
     
      
    },
    TermSearch(val, page) {},
    HandleChannelClick(data, node,el) {
      console.log(data,node,el)
      this.TreeExpanded = [0,node.key]
      if(!data.isMeeting || !data.bIsStarted)return
      let confManager = this.session.swGetConfManager();
      let conf = confManager.swGetConfByConfId(data.id)
      // conf.swParticipatorLeave({
      //   callback : (sender, response, json)=>{
          
      //   }
      // })
      conf.swParticipatorReturn({
        callback: function (sender, response, json) {
        }
      });
      console.log(data,node)
    },
    HandleTreeClick(data, node, ele) {},
    ChangePage(page) {},
    SetMeetingData(data) {
      console.log(data)
      let temp = [];
      let gpsterm = new Set();
      data.forEach((ele, i) => {
        let children = [];
        let target = false
        if(!ele)return
        if (ele._conf_particulars.length > 0) {
          ele._conf_particulars.forEach((el, i) => {
            if (el.id.indexOf("PU") != -1 && el.isonline) {
              gpsterm.add(el.id);
            }

            if(el.isadmin && el.name!='' && el.name==this.user){
              target = true
            }

            children.push({
              label: el.aliasname || el.name,
              name: el.name,
              id: el.id,
              isPerson: true,
              addr: el.addr,
              pid: el.pid,
              isOnline: el.isonline,
              isadmin: el.isadmin,
              isinseat: el.isinseat,
              isleave: el.isleave,
              isSpeak: el.isSpeak,
            });
          });
        }

        temp.push({
          label: ele._conf_base_info.name,
          id: ele._conf_base_info.id,
          bIsStarted: ele._conf_base_info.bIsStarted,
          isMeeting: true,
          UserIsAdmin: target,
          key: ele._conf_base_info.id,
          children
        });
      });

      this.$set(this.TermListData[0], "children", []);
      this.$set(this.TermListData[0], "children", temp);
      this.TreeLoading = false;

      //获取设备GPS并显示
      gpsterm.forEach(el => {
        console.log(el);
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
            console.log(sender, event, data)
            this.GetMessage(data.conf, data.data);
          break;
        case "notifyapplyforstartspeak":
            // this.SpeakNotify = this.$notify({
            //     title: '正在发言',
            //     dangerouslyUseHTMLString: true,
            //     position: 'bottom-left',
            //     type: 'success',
            //     duration: 0,
            //     message: `
            //       <p >发言:<span style='margin-left:5px'>${data.data.aliasname||data.data.name||data.data.id}</span></p>
            //     `
            //   })
            this.NowSpeakConf = data.conf._conf_base_info.name
            this.NowSpeaker = data.data.aliasname||data.data.name
            this.SetTermStatus(data.conf, data.data);
          break
        case "notifyterminatespeak":
        case "notifyapplyforendspeak":
            this.NowSpeakConf = ''
            this.NowSpeaker = ''
            this.SetTermStatus(data.conf, data.data);
          break
        case "notifyparticipartorleave":
        case "notifyparticipartorreturn":
          if(data.data.id.startsWith('PU')){
            this.SetMeetingData(this.session.swGetConfManager().swGetConfList());
          }
        case "notifyparticipatormodify":
        case "notifyinvitespeak":
        case "notifyterminatespeak":
            this.SetTermStatus(data.conf, data.data);
          break
        case "notifyconfcreate":
          let __data = this.session.swGetConfManager().swGetConfList()
          console.log('created Data: ',__data);
          this.SetMeetingData(__data);
          break
        case "notifyconfdelete":
        case "notifyparticipartoradd":
        case "notifyparticipartorremove":
        case "notifyconfstart":
        case "notifyconfstop":
          this.SetMeetingData(this.session.swGetConfManager().swGetConfList());
        default:
          // this.SetMeetingData(this.session.swGetConfManager().swGetConfList());
          break;
      }
    },
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
        case this.imsgtypes.PIC:
          _data += "img[" + receivedata[0].stFile.szFile + "]"
          break
        case this.imsgtypes.FILE:
          _data += "file(" + receivedata[0].stFile.szFile + ")["+receivedata[0].stFile.szSrcFile.split('/').splice(-1)[0]+"]"
          break
        case this.imsgtypes.GPS:
          let stGpsData = receivedata[0].stGpsData
          _data = `lat: ${stGpsData.lat / 10000000}  lng: ${stGpsData.long / 10000000} [${this.$t('Data.zanbuzhichigaileixingxiaoxi')}]`
          break
        default:
          _data = `[${this.$t('Data.zanbuzhichigaileixingxiaoxi')}]`
          return
      }
      this.layim.getMessage({
        // username: this.$t('Data.weizhi'), //消息来源用户名
        username: data.sender.aliasname || data.sender.name , //消息来源用户名
        // avatar: "http://tp1.sinaimg.cn/1571889140/180/40030060651/1", //消息来源用户头像
        avatar: require('@/assets/images/yonghu.png'), //消息来源用户头像
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
      let Term = Conf[0].children.filter(el => el.id == data.id && el.name == data.name);
      if (Term.length == 0) return;
      let temp = {
        label: data.aliasname || data.name,
        name: data.name,
        id: data.id,
        isPerson: true,
        addr: data.addr,
        pid: data.pid,
        isOnline: data.isonline,
        isadmin: data.isadmin,
        isinseat: data.isinseat,
        isleave: data.isleave,
        isSpeak: data.isSpeak,
      };
      Conf[0].bIsStarted = conf._conf_base_info.bIsStarted
      

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
    UploadImage(file, id,type,cb) {
      if (file.files.length == 0) {
        console.error("");
        return;
      }
      file.id = type+"_";
      var confManager = this.session.swGetConfManager();
      var conf = confManager.swGetConfByConfId(id);
      var myUsefulData = {
        target: file,
        id: type+"_"
      }; //用户数据，在回调中也把这个对象通知过来

      var msgItem = {
        iType: type=='img'?this.imsgtypes.PIC:this.imsgtypes.FILE,
        data: file.files[0]
      };

      var rc = conf.swConfIMSend({
        msgitems: [msgItem],
        callback: (options,response) => {
          cb(response.emms.code,type)
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
    },
    _log(code){
      console.log('log',code)
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
      session: "session",
      lang: "lang",
      user: "user",
    })
  },

  created() {

    //  清楚数据
    var cache =  layui.layim.cache();
    var local = layui.data('layim')[cache.mine.id]; //获取当前用户本地数据
    delete local.chatlog;
    layui.data('layim', {
      key: cache.mine.id
      ,value: local
    });

    this.jSW = window.jSW
    console.log("SchedulingTreeList,created");
    console.log(this.Personexit);

    let SwConfManager = this.session.swGetConfManager();
    this.$store.state.ErrorCode = SwConfManager.swInit({
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
          this.layim  = window.layim = layim;
          
          layim.config({
            brief: false, //是否简约模式（如果true则不显示主面板）
            title: "IM",
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
            isAudio: false
          });

          if(!window.layim_sendMessage){
            window.layim_sendMessage = res => {
              var mine = res.mine; //包含我发送的消息及我的信息
              var to = res.to; //对方的信息
              console.log(res.mine);
              if (to.type == "group" && mine.content.indexOf('img[')==-1 && mine.content.indexOf('file(')==-1) {
                this.ConfSendWords(this.FilterEmoji(mine.content), to.id);
              }
              console.log(mine, to);
              return false;
            }
            layim.on("sendMessage", window.layim_sendMessage);
          }

          if(!window.layim_uploadImage){
            window.layim_uploadImage = (data, info,el, callback) => {
              console.log(info);
              data.onchange = e => {
                let t = el.getAttribute('data-type')==null?'img':'file'
                this.UploadImage(e.target, info.id,t,(code,type)=>{
                  this.$store.state.ErrorCode = code
                  if(code!=0){
                    this.$Message.error(this.$t('Data.shangchuanshibai') + this.$tools.findErrorCode(code))
                    return
                  }
                  callback(type);
                  this.$Message.success(this.$t('Data.shangchuanchenggong'))
                });
              };
            }
            layim.on("uploadImage", window.layim_uploadImage);
          }
        });
      }
    });
    
  },
  destroyed() {
    
    $(".layui-layim-min").remove()
    $(".layui-layim").remove()
    $(".layui-layim-chat").remove()
  }
};
</script>

<style lang="less">
  @import "./TreeList.less";

  .speak_fixed {
    width: 280px;
    height: 50px;
    background-color: #ccc;
    position: fixed;
    bottom: 0;
    left: 0;
    p{
      font-weight: 600;
      span {
        margin-left: 10px;
        color: green
      }
    }
  }
// #TermList {
//   width: 100%;
//   height: 100%;

//   .el-loading-parent--relative {
//     height: 100%;
//   }
//   .search {
//     margin: 0px 0 6px 0;
//   }
//   .showonline {
//     .cb {
//       font-size: 15px;
//       margin-left: 10px;
//     }
//     height: 30px;
//     font-size: 18px;
//     background: rgb(242, 242, 242);
//   }

//   .TreeList {
//     width: 100%;
//     height: calc(100% - 98px);
//     padding-top: 5px;
//     border-right: 1px solid #dcdfe6;
//     box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
//     overflow: auto;
//     .el-tree-node__content {
//       overflow: initial!important;
//       height: 30px !important;
//       font-size: 14px !important;
//     }
//     .pu_id{
//       color:#ccc
//     }
//   }
//   div.Page {
//     height: 30px;
//     width: 100%;
//     text-align: center;
//     .el-pagination {
//       display: inline-block;
//     }
//     // background-color: #ccc;
//   }
// }
// .SchedulingList {
//   .TreeList {
//     height: calc(100% - 38px) !important;
//   }
//   .InvaiteDialog{
//     .el-divider.el-divider--horizontal{
//       margin-top:0px
//     }
//     .el-checkbox-group {
//       display: grid;
//       grid-gap: 5px;
//       grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
//       .el-checkbox{
//         margin-right:0px;
//       }
//     }
//   }
//   .el-checkbox.is-bordered+.el-checkbox.is-bordered{
//     margin-left: 0px;
//   }
// }
// .custom-tree-node {
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   font-size: 14px;
//   padding-right: 8px;
// }
// .layim-send-voice {
//   cursor: pointer;
//   color: #fff;
//   position: absolute;
//   width: 100px;
//   top: 3px;
//   height: 32px;
//   transform: translateX(-50%);
//   left: 50%;
//   background-color: #5fb878;
//   border-radius: 3px;
//   text-align: center;
//   line-height: 32px;
// }
// .layim-send-voice:active {
//   background-color: rgb(3, 31, 11);
// }
</style>
