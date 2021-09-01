<template>
  <div id="TermList">
    <Input
      v-inputFilter:f-iview-search
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
    <div class="TreeList">
      <el-tree
        v-loading="TreeLoading"
        :data="TermListData"
        :highlight-current="true"
        node-key="key"
        :indent="8"
        :default-expanded-keys="['0']"
        :expand-on-click-node="false"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span @dblclick="HandleChannelClick(data, node)">
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
              class="unselectable"
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
        :pager-count="5"
        @current-change="ChangePage"
      ></el-pagination>
    </div>
    <!-- 分页 -->
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: ["noShowChannel"],
  data() {
    return {
      DeviceGroup: require("@/assets/images/deviceGroup.png"),
      VideoState: require("@/assets/images/video2.png"),
      VideoErrorState: require("@/assets/images/video2-error.png"),
      ChannelUrl: require("@/assets/images/channel.png"),
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
          label: this.$t("Monitor.Server"),
          key: 0,
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
    HandleChannelClick(data, node) {
      if (data.isTerm) {
        // let channel = this.session.swGetPuChanel(data.pu_id, 65536);
        // console.log(channel);
        this.$emit("on-term-click", data.pu_id, data.isOnline);
        return;
      }

      if (data.$treeNodeId == 1) {
        return;
      }
      if (!data.isChannel) {
        return;
      }
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
        if (!this.noShowChannel) {
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
    GroupIsExistPu(group,puList) {
      for(let i = 0; i < group.szpu.length; i++) {
        for(let j = 0; j < puList.length; j++) {
          if(group.szpu[i]._id_pu === puList[j].pu_id) {
            return true
          }
        }
      }
      for(let i = 0; i < group.items.length; i++) {
        let result = this.GroupIsExistPu(group.items[i],puList)
        if(result) {
          return result
        }
      }

      return false
    },
    SetTreeData(name) {
      if (this.SearchStatus) return;
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
          if (this.noShowChannel) {
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

      let SortTemp = [];
      temp.forEach((el) => {
        if (el.isOnline) {
          SortTemp.unshift(el);
        } else {
          SortTemp.push(el);
        }
      });

      // 获取设备组
      /*
      let PuGroupList = []
      let funcGetPuGroupInfo = (parent, group, callback) => {
        let puGroup = {}
        puGroup.id = group.szid
        puGroup.name = group.szname
        puGroup.parentId = group.szparentid
        puGroup.groupList = []
        puGroup.puList = []

        group.items.forEach((childGroup) => {
          funcGetPuGroupInfo(puGroup.groupList, childGroup);
        });

        this.$store.state.ErrorCode = this.session.swGetPuGroupInfo({
          info: { groupid: group.szid },
          callback: (options, response, data) => {
            puGroup.puList = data.ppuidList
            parent.push(puGroup)

          },
        });
      };
      */
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
                console.log(data)
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
              if (that.isFirst) that.isFirst = false;
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
          this.$store.state.ErrorCode = response.emms.code;
          // console.log(
          //   "searchlist============================\n",
          //   options,
          //   response,
          //   data
          // );
          this.Total = data.info.itotalcount;
          this.CurrentPage = page + 1;
          if (this.isFirst) {
            if (data.puList.length == 0 && isOnline) {
              this.GetTermList(0, 100, false);
              return;
            }
            this.Cb_isOnline = isOnline;
            this.SetTreeData(isOnline ? "_arr_pu_online" : "_arr_pu");
          } else {
            this.SetTreeData(isOnline ? "_arr_pu_online" : "_arr_pu");
          }
        },
      });
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
      // if(this.TreeLoading)return
      console.log("notify:", val);
      // console.log("TermListData:",this.TermListData[0].children);

      // let filterData = this.TermListData[0].children.filter(el=>{return el.pu_id==val.content._id_pu})
      // if(filterData.length>0){
      //   filterData
      // }else{

      // }
      // return
      if (this.Cb_isOnline && !this.isFirst) {
        this.GetTermList(this.CurrentPage - 1, 100, true);
      }
      if (!this.Cb_isOnline && !this.isFirst) {
        // this.SetTreeData("_arr_pu");
        this.GetTermList(this.CurrentPage - 1, 100, false);
      }
    },
    Cb_isOnline(val) {
      if (!this.isFirst) {
        if (this.SearchStatus) {
          this.TermSearch(this.Search, 0);
        } else {
          this.GetTermList(0, 100, val);
        }
      }
    },
  },
  computed: {
    ...mapState({
      session: "session",
      notify: "notify",
    }),
  },

  created() {
    console.log("created");
    console.log(this.session);
    this.GetTermList(0, 100, true);
    // this.session.swAddCallBack('pulist',(sender, cmd, data)=>{
    //   console.log("pulist============================\n",sender, cmd, data);
    // })
  },
};
</script>

<style lang="less">
@import "../../Monitor/TreeList.less";
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
</style>

