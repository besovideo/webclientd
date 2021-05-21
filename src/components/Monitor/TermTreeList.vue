<template>
  <div id="TermList">
    <Input
      class="search"
      @on-search="TermSearch"
      v-model="Search"
      search
      clearable
      placeholder
    />
    <div class="showonline">
      <Checkbox class="cb" v-model="Cb_isOnline">{{
        $t("Monitor.Showonlyonlinedevices")
      }}</Checkbox>
    </div>
    <!-- 设备列表 -->
    <div class="TreeList" ref="treeTerm" @contextmenu="BoxRightClick($event)">
      <el-tree
        ref="tree"
        v-loading="TreeLoading"
        :data="TermListData"
        :highlight-current="true"
        node-key="key"
        :indent="8"
        :default-expanded-keys="['0']"
        :expand-on-click-node="false"
        @check="CheckTermBox"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <!-- <el-tooltip  placement="right" :disabled="disabled" :transfer="true" effect="light" v-if="data.pu_id!=='0'">
            <template slot="content" >
              <div style="font-size:16px;margin-bottom:10px;" v-if="data.isChannel">{{ChanneTooltip}}</div>
              <div style="font-size:16px;margin-bottom:10px;" v-if="data.isTerm">{{TermTooltip}}</div>
              <div style="text-align:center">
                <el-link type="success" @click="$emit('on-tooltip-disabled')">{{$t('Data.buzaixianshi')}}</el-link>
              </div>
            </template> -->
          <span @dblclick="HandleChannelClick(data, node)" >
            <i
              v-if="node.label == ''"
              class="el-icon-s-data"
              style="padding-right: 5px"
            ></i>
            <img
              v-if="data.isGroup"
              :src="DeviceGroup"
              width="15"
              height="15"
              style="display: block; float: left; margin: 3px 5px 0 0"
              alt
            />
            <img
              v-if="data.isTerm"
              :src="data.isOnline == 0 ? VideoErrorState : VideoState"
              width="15"
              height="15"
              style="display: block; float: left; margin: 3px 5px 0 0"
              alt
            />
            <img
              v-if="data.isChannel"
              :src="ChannelUrl"
              width="15"
              height="15"
              style="display: block; float: left; margin: 3px 5px 0 0"
              alt
            />
            <!-- @dblclick.stop.prevent="HandleTreeClick(data,node)" -->

            <span
              slot="reference"
              class="unselectable TermTree"
              :puid="data.pu_id"
              :style="{
                color: data.isOnline == 0 ? '#ccc' : 'inherit',
                paddingLeft: 10,
              }"
              >{{ node.label }}</span
            >
            <span class="pu_id" v-if="data.isTerm" :title="data.pu_id.slice(3)">
              <!-- {{node.label==node.pu_id?"":`(${node.pu_id})`}} -->
              ({{ data.pu_id.slice(3) }})
            </span>
          </span>
          <!-- </el-tooltip > -->
          <!-- <span v-if="data.key=='0'">
            {{data.label}}
          </span> -->
        </span>
      </el-tree>
    </div>
    <!-- 设备列表 -->

    <!-- 分页 -->
    <div class="Page">
      <el-pagination
        :current-page.sync="CurrentPage"
        :page-size="100"
        layout="prev, pager, next"
        :total="Total"
        :pager-count="4"
        @current-change="ChangePage"
      ></el-pagination>
    </div>
    <!-- 分页 -->

    <div
      v-if="contextMenuVisible"
      @click="contextMenuVisible = false"
      @contextmenu.stop.prevent="contextMenuVisible = false"
      style="
        background: rgba(0, 0, 0, 0);
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 998;
      "
    ></div>

    <context-menu
      class="right-menu"
      :target="$refs.treeTerm"
      :show="contextMenuVisible"
    >
      <!-- @update:show="(show) => contextMenuVisible = show"> -->

        <ul
          class="rightMenu-ul"
        >
          <li v-if="showLocateMenu" v-for="(item,index) in this.$store.state.locateCheckData[rigthClickPuID]" class="right_menu_li" :key="index">
            <i v-if="item.isChecked" class="el-icon-check" />
            <a href="javascript:;" @click="SetRightMenuVal(item)">{{
                item.label
              }}</a>
          </li>
          <li v-if="showMenu"  v-for="(item,index) in normalMenu"  class="right_menu_li">
              <i v-if="item.isChecked" class="el-icon-check" />
              <a href="javascript:;" @click="SetRightMenuVal(item)">{{
                  item.label
                }}</a>
          </li>

<!--          <el-tooltip class="menu-tooltip"  effect="light"  placement="right" v-else>-->
<!--            <template slot="content">-->
<!--              <li class="right_menu_li">-->
<!--                <a href="javascript:;" >开启</a>-->
<!--              </li>-->
<!--              <li class="right_menu_li" >-->
<!--                <a href="javascript:;">关闭</a>-->
<!--              </li>-->
<!--            </template>-->
<!--            <li class="right_menu_li">-->
<!--              <a href="javascript:;">远程抓拍2</a>-->
<!--            </li>-->
<!--          </el-tooltip>-->
        </ul>




    </context-menu>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { component as VueContextMenu } from "@xunlei/vue-context-menu";
export default {
  props: ["showLocateMenu", "TermTooltip", "ChanneTooltip", "showMenu"], // 'disabled'
  components: {
    "context-menu": VueContextMenu,
  },
  data() {
    return {
      DeviceGroup: require("@/assets/images/deviceGroup.png"),
      VideoState: require("@/assets/images/video2.png"),
      VideoErrorState: require("@/assets/images/video2-error.png"),
      ChannelUrl: require("@/assets/images/channel.png"),
      Cb_isOnline: true,
      TreeLoading: true,
      contextMenuVisible: false,
      isFirst: true,
      NameSearch: "",
      NameSelect: "1",
      TypeSelect: "1",
      CurrentPage: 1,
      Total: undefined,
      Search: "",
      SearchStatus: undefined,
      allCheckedTerm: [],
      rigthClickPuID: undefined,
      locateCheckData: {},

      optionsRecord: {
        time: 100,
        filename: '',
        fileType: 1,
      },
      normalMenu: [
        {
          label: this.$t('Data.yuanchengluyin'),
          isChecked: false,
          key: "brecordaudio",
        },
        {
          label: this.$t('Data.yuanchengluxiang'),
          isChecked: false,
          key: "brecordvideo",
        },
        {
          label: this.$t('Data.yuanchengzhuapai'),
          isChecked: false,
          key: "brecordimage",
        },
      ],
      TermListData: [
        {
          label: this.$t("Monitor.Server"),
          pu_id: "0",
          key: "0",
          children: [
            {
              label: "",
            },
          ],
        },
      ],
    };
  },
  methods: {

    SetRightMenuVal(item) {
      console.log("item.key :", item.key, item.isChecked);
      this.contextMenuVisible = false;
      let clickID = this.rigthClickPuID + "";

      if (item.key == "guiji" && item.isChecked) {
        let Weizhi = this.$store.state.locateCheckData[this.rigthClickPuID][0];
        if (!Weizhi.isChecked) {
          Weizhi.isChecked = true;
          this.$emit("on-check-term", clickID, "weizhi", item.isChecked);
        }
      }
      this.$emit("on-check-term", clickID, item.key, item.isChecked);

      switch (item.key) {
        case "brecordvideo":
          this.puRecordVideo(clickID, !item.isChecked, 9)
          break;
        case "brecordaudio":
          this.puRecordVideo(clickID, !item.isChecked, 8)
          break;
        case "brecordimage":
          this.puSnapshot(clickID, !item.isChecked)
          break;
        default:
          this.$set(item, "isChecked", !item.isChecked);
          break
      }
    },
    puSnapshot(id, checked) {
      let pu = this.session.swGetPu(id);
      if (!pu) {
        this.$Message.error(this.$t('Data.lianjieshibai'))
        return
      }
      pu.swSetPuSnapshot({
        istart: 1,
        callback:  (options, response) => {
          if (response.emms.code === jSW.RcCode.RC_CODE_S_OK) {
            setTimeout( () => pu.swSetPuSnapshot({ istart: 0 }) , 500)
            this.$Message.success( this.$t('Data.zhuapai')  + (checked ? this.$t('Data.chenggong') : this.$t('Data.tingzhi')))
          } else {
            this.$Message.error(this.$t('Data.lianjieshibai')+ ' ' + this.$tools.findErrorCode(response.emms.code))
          }
        }
      });
      // this.$prompt('请输入邮箱',  this.$t('Data.yuanchengzhuapai'), {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
      //   inputErrorMessage: '邮箱格式不正确'
      // }).then(({ value }) => {
      //   this.$message({
      //     type: 'success',
      //     message: '你的邮箱是: ' + value
      //   });
      // }).catch(() => {
      //   this.$message({
      //     type: 'info',
      //     message: '取消输入'
      //   });
      // });
    },
    puRecordVideo(id, checked, type) {
      this.optionsRecord.fileType = type
      if (!checked) {
        this.doPuRecord(id, false, this.optionsRecord)
        return
      }
      let title = this.$t('Data.yuanchengluxiang')
      let target = this.$t('Data.luxiang')
      if (type === 8) {
        title = this.$t('Data.yuanchengluyin')
        target = this.$t('Data.luyin')
      }
      const h = this.$createElement;
      this.optionsRecord.time = 100
      this.$msgbox({
        title: title,
        message: h('p', null, [
          h('i', null, target + this.$t('Data.shijian') + "(s); -1 "+ this.$t('Data.biaoshiyizhilu')),
          h('div',{class: 'el-input'}, [
            h('input', {
              domProps: {
                value: this.optionsRecord.time,
                type: 'number'
              },
              class: 'el-input__inner',
              on: {
                input:  (value) => {
                  this.optionsRecord.time =  event.target.value
                },
              }
            }),
          ]),
          h('i', null, target + this.$t('Data.wenjianming')),
          h('div',{class: 'el-input'}, [
            h('input', {
              domProps: {
                value: this.optionsRecord.filename
              },
              class: 'el-input__inner',
              on: {
                input:  (event) => {
                  this.optionsRecord.filename = event.target.value
                },
              }
            }),
          ]),
        ]),
        showCancelButton: true,
        confirmButtonText: this.$t('Data.queding'),
        cancelButtonText: this.$t('Data.quxiao'),
      }).then(res=>{
        console.log(res, this.optionsRecord.time, this.optionsRecord.filename)
        if (!this.optionsRecord.time) {
          this.$Message.error(this.$t('Data.shijiangeshibuzhengque'))
          return
        }
        this.doPuRecord(id, true, this.optionsRecord)
      })
    },
    doPuRecord(id, isRecord, {time = 0, filename = '', fileType }) {
      let pu = this.session.swGetPu(id);
      if (!pu) {
        this.$Message.error(this.$t('Data.lianjieshibai'))
        return
      }
      console.log('fileType:' ,fileType)
      pu.swSetPuManualrecord({
        isstart: isRecord ? 1 : 0,
        ilength: time || 0,
        szFileName: filename || '',
        iFileType: fileType,
        iChannel: 0,
        callback: (sender, response, data) => {
          if (response.emms.code === jSW.RcCode.RC_CODE_S_OK) {
            let str = this.$t('Data.luxiang')
            if (fileType === 8) {
              str = this.$t('Data.luyin')
            }
            this.$Message.success(str + (isRecord ? this.$t('Data.kaishi') : this.$t('Data.tingzhi')))
          } else {
            this.$Message.error(this.$t('Data.lianjieshibai')+ ' ' + this.$tools.findErrorCode(response.emms.code))
          }
        }
      })
    },
    puRecordImage(id) {

    },
    FindPuNode() {
      let funcFindPuNode = (el) => {
          if(el == undefined || el == null)
          {
            return null
          }

          if(el.isTerm){
            if( el.pu_id == this.rigthClickPuID )
            {
              return el
            }
          }else if(el.isGroup)
          {
            for(let i = 0; i < el.children.length; i++) {
              let result = funcFindPuNode(el.children[i])
              if(result != null)
              {
                return result
              }
          }
        }

        return null
      }

      for(let i =0; i < this.TermListData[0].children.length;i++) {
        let el = this.TermListData[0].children[i]
        let result = funcFindPuNode(el)
        if(result != null)
        {
          return result
        }
      }

      return null
    },
    getCurrPuRecordStatus(pu) {
      if (!pu) {
        pu = this.session.swGetPu(this.rigthClickPuID);
        if (!pu) {
          this.$Message.error(this.$t('Data.lianjieshibai'))
          return false
        }
      }

      return new Promise((resolve, reject)=>{
        let rc = pu.swGetPuRecordStatus({
          callback: (options, response, data)=>{
            if( rc !== 0 || !data ){
              this.$Message.error(this.$t('Data.huoqushebeizhuangtaishibai'))
              resolve(false)
            }else{
              console.log("status: ", data)
              for (const key in data) {
                this.normalMenu.forEach(item=>{
                  if (item['key'] === key) {
                    item.isChecked = data[key]
                  }
                })
              }
              resolve(true)

            }
          }
        })
      })

    },
    async BoxRightClick(e) {
      // let div = document.querySelector('.TermTree')
      if (e.target.classList.contains("TermTree") && (this.showLocateMenu || this.showMenu) ) {
        this.rigthClickPuID = e.target.getAttribute("puid");
        // let PuIdData = this.TermListData[0].children.find(
        //   (el) => el.pu_id == this.rigthClickPuID
        // );
        let PuIdData = this.FindPuNode()

        if (PuIdData == null || !PuIdData.isOnline) {
          return;
        }

        let pu = this.session.swGetPu(this.rigthClickPuID);

        if (!pu) {
          this.$Message.error(this.$t('Data.lianjieshibai'))
          return
        }
        let flag = await this.getCurrPuRecordStatus(pu)


        if (!flag) return

        if (!this.$store.state.locateCheckData[this.rigthClickPuID]) {
          this.$set(this.$store.state.locateCheckData, this.rigthClickPuID, [
            {
              label: this.$t("Data.xianshishishiweizhi"),
              isChecked: false,
              key: "weizhi",
            },
            {
              label: this.$t("Data.xianshiguiji"),
              isChecked: false,
              key: "guiji",
            },
          ]);
        }
        this.contextMenuVisible = true;
      } else {
        this.contextMenuVisible = false;
      }
    },
    CheckTermBox(self, allCheckedNodes) {
      let check = allCheckedNodes.checkedKeys;
      this.allCheckedTerm = check;

      console.log(self, allCheckedNodes);
      if (self.pu_id == "0") {
        return;
      }

      // if(check.findIndex(el=>el==self.pu_id)==-1){
      //   this.$emit('on-check-term','remove',[self.pu_id])
      // }else{
      //   this.$emit('on-check-term','add',[self.pu_id])
      // }
    },
    TermSearch(val, page) {
      console.log(val);
      let isOnline = this.Cb_isOnline;
      let code = this.session.swSearchPuList({
        iPosition: page == undefined ? 0 : page,
        iCount: 100,
        stFilter: {
          iOnlineStatus: isOnline ? 1 : 0,
          iTimeBegin: 0,
          iTimeEnd: 0,
          szIDOrName: val,
        },
        callback: (options, response, data) => {
          // let term = this.session.swGetPu(val);
          if (data.puList.length == 0) {
            this.$Message.error(this.$t("Monitor.noTerm"));
            return;
          }
          console.log("search", data);
          this.CurrentPage = page == undefined ? 1 : page + 1;
          this.Total = data.info.itotalcount;
          this.Search2SetData(data);
          return;
        },
      });
    },
    HandleCentContentShow(target) {
      for (const key in this.CentCenterShowList) {
        if (this.CentCenterShowList.hasOwnProperty(key)) {
          this.CentCenterShowList[key] = false;
          console.log(key);
        }
      }
      this.$nextTick(() => {
        this.CentCenterShowList[target] = true;
      });
    },
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
    HandleTreeClick(data, node, ele) {
      if (data.$treeNodeId == 1) {
        return;
      }
      if (data.isOnline == 0) {
        this.$Message.error(this.$t("Data.shebeiyilixian"));
        return;
      }
      if (!data.isTerm) {
        return;
      }
      this.ChannelContent = false;
      this.ReloadContent = true;
      // this.ReloadContent = false((this.pu_id = data.pu_id));
      this.CurrentPuInfo = data;
    },
    ChangePage(page) {
      if (this.SearchStatus) {
        this.TermSearch(this.Search, page - 1);
        return;
      }
      this.GetTermList(page - 1, 100, this.Cb_isOnline);
    },
    Search2SetData(data) {
      let temp = [];
      this.SearchStatus = true;
      data.puList.forEach((ele, i) => {
        let children = [];
        if (!this.showLocateMenu) {
          ele._arr_channel.forEach((el, i) => {
            children.push({
              label: this.$t("Monitor.channel") + i,
              index: i,
              pu_id: el._id_pu,
              isChannel: true,
            });
          });
        }
        temp.push({
          label: ele._name_pu || ele._id_pu,
          pu_id: ele._id_pu,
          isTerm: true,
          isOnline: ele._info_pu.onlinestatus,
          children,
        });
      });

      this.$set(this.TermListData[0], "children", []);
      this.$set(this.TermListData[0], "children", temp);
      this.TreeLoading = false;
    },
    SetTreeData(name) {
      if (this.SearchStatus) return;
      // let list = [];
      // this.session._arr_pu.forEach(item => {
      //   list.push({
      //     label: item._name_pu || item._id_pu,
      //     pu_id: item._id_pu,
      //     isOnline: item._info_pu.onlinestatus
      //   });
      // });
      // this.$set(this.TermListData[0], "children", list);
      this.TreeLoading = true;
      let CurrentPage = this.CurrentPage;
      if (this.CurrentPage > Math.ceil(this.session[name].length / 100)) {
        CurrentPage = Math.ceil(this.session[name].length / 100);
      }

      let temp = [];
      if (name == "_arr_pu") {
        let num = [];
        if ((CurrentPage - 1) * 100 < this.session["_arr_pu_online"].length) {
          this.session[name].forEach((el, i) => {
            if (el._info_pu.onlinestatus == 1) {
              num.push(i);
            }
          });
          num
            .filter((el) => el > 99)
            .forEach((_i) => {
              this.session[name].forEach((el, i) => {
                if (el._info_pu.onlinestatus != 1) {
                  let temp = this.session[name][i];
                  this.session[name][i] = this.session[name][_i];
                  this.session[name][_i] = temp;
                }
              });
            });
        }
      }
      this.session[name].forEach((ele, i) => {
        // this.Total = this.session[name].length;
        if (i >= (CurrentPage - 1) * 100 && i < (CurrentPage - 1) * 100 + 100) {
          let children = [];
          if (this.showLocateMenu) {
          } else {
            ele._arr_channel.forEach((el, i) => {
              if (ele._info_pu.onlinestatus != 0)
                children.push({
                  label: this.$t("Monitor.channel") + i,
                  index: i,
                  pu_id: ele._id_pu,
                  isChannel: true,
                });
            });
          }
          temp.push({
            label: ele._name_pu || ele._id_pu,
            pu_id: ele._id_pu,
            isTerm: true,
            pu_info: ele._info_pu,
            isOnline: ele._info_pu.onlinestatus,
            children,
          });
        }
      });

      if (this.Total == 0) {
        this.$set(this.TermListData[0], "children", []);
        this.TreeLoading = false;
        return;
      }

      let giveLocateOnlineTerm = [];
      let SortTemp = [];
      temp.forEach((el) => {
        if (el.isOnline) {
          SortTemp.unshift(el);
          giveLocateOnlineTerm.push(el);
        } else {
          SortTemp.push(el);
        }
      });

      // 获取设备组
      let funcAddGroup = (parent, group) => {
        let children = [];

        group.items.forEach((childGroup) => {
          funcAddGroup(children, childGroup);
        });
        group.szpu.forEach((pu) => {
          let index = -1;
          SortTemp.forEach((puObj, i) => {
            if (pu._id_pu == puObj.pu_id) {
              children.push(puObj);
              index = i
            }
          });
          //  将已添加到设备组中的设备从原来的设备列表中删除
          if(-1 != index)
          {
            SortTemp.splice(index,1)
          }
        });

        parent.unshift({
          label: group.szname,
          group_id: group.szid,
          parent_group_id: group.szparentid,
          isGroup: true,
          children,
        });
      };

      this.$store.state.ErrorCode = this.session.swPuGroupFillGroupList({
         tag: this,
         callback: function(options, response, data){
            // console.log(data)
            let that = options.tag
            that.$store.state.ErrorCode = response.emms.code;
            data.result.forEach(group => {
                  funcAddGroup(SortTemp,group)
            });

            that.$set(that.TermListData[0], "children", []);
            that.$set(that.TermListData[0], "children", SortTemp);

            if (document.querySelector(".TreeList"))
              document.querySelector(".TreeList").scrollTop = 0;
            that.TreeLoading = false;
            if (that.isFirst) {
              // giveLocateOnlineTerm.forEach(item=>{

              // })
              that.$emit("on-online-term", giveLocateOnlineTerm);
              that.isFirst = false;
            }
            },
            filterCallback: function(puInfo, puId) {
              for(let i = 0; i < SortTemp.length; i++){
                if(puId === SortTemp[i].pu_id)
                {
                  return true
                }
              }
              return false
            },//过滤组内的设备
            filterListCallback: function(puInfo) {
                return true;
            }//过滤组外的设备，puInfo就是组外的设备
      });

      // this.$nextTick(()=>{
      //   if(this.allCheckedTerm[0]=='0'){
      //     this.$refs.tree.setCheckedKeys(this.allCheckedTerm.slice(1))
      //     return
      //   }
      //   this.$refs.tree.setCheckedKeys(this.allCheckedTerm)
      // })
    },
    GetTermList(page, pagesize, isOnline) {
      // if(this.session._arr_pu_online.length>0){
      //   this.SetTreeData("_arr_pu_online");
      // }
      // this.TreeLoading = true
      let code = undefined;
      this.$store.state.ErrorCode = code = this.session.swSearchPuList({
        iPosition: page * 100,
        iCount: pagesize,
        stFilter: {
          iOnlineStatus: isOnline ? 1 : 0,
          iTimeBegin: 0,
          iTimeEnd: 0,
        },
        callback: (options, response, data) => {
          // debugger
          this.$store.state.ErrorCode = response.emms.code;
          // console.log(
          //   "searchlist============================\n",
          //   options,
          //   response,
          //   data
          // );
          this.Total = data.info.itotalcount;
          this.CurrentPage = page + 1;
          // if (this.isFirst) {
          //   // if (data.puList.length == 0 && isOnline) {
          //   //   this.GetTermList(0, 100, false);
          //   //   return;
          //   // }
          //   // this.Cb_isOnline = isOnline;
          //   this.SetTreeData(isOnline ? "_arr_pu_online" : "_arr_pu");
          // } else {
          //   this.SetTreeData(isOnline ? "_arr_pu_online" : "_arr_pu");
          // }
          this.SetTreeData(isOnline ? "_arr_pu_online" : "_arr_pu");
          this.Cb_isOnline = isOnline;
        },
      });
    },
    initLocateCheckData(data) {
      for (let key in data) {
        data[key].forEach((el) => {
          this.$emit("on-check-term", key, el.key, el.isChecked);
        });
      }
    },
  },
  watch: {
    Search(val) {
      if (val == "") {
        if (this.SearchStatus) {
          this.SearchStatus = false;
          this.GetTermList(0, 100, this.Cb_isOnline);
        }
      }
    },
    // "session._arr_pu_offline"(val) {
    //   console.log("Offline_Update");
    //   if (!this.Cb_isOnline&&!this.isFirst) {
    //     this.GetTermList(this.CurrentPage-1,100,false)
    //   }
    // },

    notify(val) {
      // console.log('allCheck',this.$refs.tree.getCheckedKeys())
      // if(this.TreeLoading)return
      console.log("ONline");

      if (this.Cb_isOnline && !this.isFirst) {
        this.GetTermList(this.CurrentPage - 1, 100, true);
      }
      if (!this.Cb_isOnline && !this.isFirst) {
        // this.SetTreeData("_arr_pu");
        this.GetTermList(this.CurrentPage - 1, 100, false);
      }
    },
    record_status(val) {

      if (val.target !== this.rigthClickPuID) {
        return
      }
      console.log("record status change :", this.rigthClickPuID)

      this.getCurrPuRecordStatus()
    },
    Cb_isOnline(val) {
      if (val === true) {
        localStorage.setItem("cb_online", val);
      } else {
        localStorage.removeItem("cb_online");
      }
      // if (!this.isFirst) {
      if (this.SearchStatus) {
        this.TermSearch(this.Search, 0);
      } else {
        this.GetTermList(0, 100, val);
      }
      // }
    },
  },
  computed: {
    ...mapState({
      session: "session",
      notify: "notify",
      record_status: "record_status"
    }),
  },
  mounted() {
    this.initLocateCheckData(this.$store.state.locateCheckData);
  },
  created() {
    console.log("created");
    console.log(this.session);
    console.log(
      "this.$store.state.locateCheckData ",
      this.$store.state.locateCheckData
    );

    if (localStorage.getItem("cb_online", undefined)) {
      this.Cb_isOnline = true;
      this.GetTermList(0, 100, true);
      return;
    }

    this.Cb_isOnline = false;

    this.GetTermList(0, 100, false);
  },
};
</script>

<style lang="less">
@import "./TreeList.less";
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
// .el-tree-node>.el-tree-node__children{
//   overflow: initial!important;
// }
.right-menu {
  position: fixed;
  background: #fff;
  border: 2px solid #ccc;
  box-shadow: 0 0.5em 1em 0 rgba(0, 0, 0, 0.1);
  border-radius: 1px;
  z-index: 999;
  display: none;
  > .rightMenu-ul {
    &:nth-child(n + 2) {
      border-top: 1px solid #ccc;
    }

  }
}

.right_menu_li {
  padding-left: 24px;
  position: relative;
  height: 28px;
  background-color: rgba(110, 107, 107, 0.2);
  > i {
    display: inline-block;
    width: 20px;
    height: 20px;
    font-weight: 700;
    font-size: 16px;

    color: #000;
    border: 1px solid skyblue;
    background-color: #fff;
    line-height: 20px;
    position: absolute;
    left: 2px;
    top: 4px;
    text-align: center;
  }
}
.right-menu a, .right_menu_li a{
  // width: 100px;
  height: 28px;
  background: #fff;
  line-height: 20px;
  text-align: left;
  display: block;
  color: #1a1a1a;
}

.right-menu a:hover , .right_menu_li a:hover {
  color: #fff;
  background: #42b983;
}

body,
html {
  height: 100%;
}

.rightMenu-ul a, .right_menu_li a {
  text-decoration: none;

}

.right-menu a, .right_menu_li a {
  padding: 5px;
}
.el-tooltip__popper.is-light  {
  padding: 0;
}
</style>

