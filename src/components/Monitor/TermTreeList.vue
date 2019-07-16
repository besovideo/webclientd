<template>
  <div id="TermList">
    <Input class="search" @on-search="TermSearch" search clearable placeholder />
    <div class="showonline">
      <Checkbox class="cb" v-model="Cb_isOnline">{{$t('Monitor.Showonlyonlinedevices')}}</Checkbox>
    </div>
      <!-- 设备列表 -->
      <div class="TreeList">
        <el-tree
          v-loading="TreeLoading"
          :data="TermListData"
          :highlight-current="true"
          node-key="key"
          :default-expanded-keys="['0']"
          @node-click="HandleChannelClick"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <i v-if="node.label=='江西省'" class="el-icon-s-data" style="padding-right:5px;"></i>
            <img
              v-if="data.isTerm"
              :src="data.isOnline==0?VideoErrorState:VideoState"
              width="15"
              height="15"
              style="display:block;float: left;margin:3px 5px 0 0 ;"
              alt
            />
            <img
              v-if="data.isChannel"
              :src="ChannelUrl"
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
          @current-change="ChangePage"
        ></el-pagination>
      </div>
      <!-- 分页 -->
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: ['noShowChannel'],
  data() {
    return {
      VideoState: require('@/assets/images/video2.png'),
      VideoErrorState: require('@/assets/images/video2-error.png'),
      ChannelUrl: require('@/assets/images/channel.png'),
      Cb_isOnline:false,
      TreeLoading:true,
      isFirst: true,
      NameSearch: "",
      NameSelect: "1",
      TypeSelect: "1",
      CurrentPage: 1,
      Total:undefined,
      TermListData: [
        {
          label: this.$t('Monitor.Server'),
          key: 0,
          children: [
            {
              label: ""
            }
          ]
        }
      ]
    };
  },
  methods: {
    TermSearch(val){
      console.log(val);
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
        let channel = this.session.swGetPuChanel(data.pu_id, 0);
        this.$emit('on-term-click',channel)
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
      this.$emit('on-click',channel,data.index)

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
        this.$Message.error("设备已离线");
        return;
      }
      if (!data.isTerm) {
        return;
      }
      this.ChannelContent = false;
      this.ReloadContent = true;
      this.ReloadContent = false;
      // (this.VideoKey = [
      //   new Date()
      //     .getTime()
      //     .toString()
      //     .slice(5),
      //   1 +
      //     new Date()
      //       .getTime()
      //       .toString()
      //       .slice(5),
      //   2 +
      //     new Date()
      //       .getTime()
      //       .toString()
      //       .slice(5),
      //   3 +
      //     new Date()
      //       .getTime()
      //       .toString()
      //       .slice(5)
      // ]),
        (this.pu_id = data.pu_id);
      this.CurrentPuInfo = data;
      // let chanel = this.session.swGetPuChanel(data.pu_id,0)
      // console.log(chanel);
    },
    ChangePage(page) {
      this.SetTreeData("_arr_pu");
    },
    SetTreeData(name) {
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
      let temp = [];
      if (name == "_arr_pu") {
        let num = [];
        if (
          (this.CurrentPage - 1) * 100 <
          this.session["_arr_pu_online"].length
        ) {
          this.session[name].forEach((el, i) => {
            if (el._info_pu.onlinestatus == 1) {
              num.push(i);
            }
          });
          num
            .filter(el => el > 99)
            .forEach(_i => {
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
        this.Total = this.session[name].length;
        if (
          i >= (this.CurrentPage - 1) * 100 &&
          i < (this.CurrentPage - 1) * 100 + 100
        ) {

          let children = [];
          if(this.noShowChannel){

          }else{
            ele._arr_channel.forEach((el,i)=>{
              if(ele._info_pu.onlinestatus!=0)
              children.push(
                {
                  label:this.$t('Monitor.channel')+i,
                  index: i,
                  pu_id: ele._id_pu,
                  isChannel: true
                }
              )
            })
          }
          temp.push({
              label: ele._name_pu || ele._id_pu,
              pu_id: ele._id_pu,
              isTerm: true,
              isOnline: ele._info_pu.onlinestatus,
              children
          });
          
        }
      });

      if (this.Total == 0) {
        this.$set(this.TermListData[0], "children", []);
        this.TreeLoading = false;
        return;
      }

      let SortTemp = [];
      temp.forEach(el => {
        if (el.isOnline) {
          SortTemp.unshift(el);
        } else {
          SortTemp.push(el);
        }
      });
      this.$set(this.TermListData[0], "children", []);
      this.$set(this.TermListData[0], "children", SortTemp);
      if (document.querySelector(".TreeList"))
        document.querySelector(".TreeList").scrollTop = 0;
      this.TreeLoading = false;
      if (this.isFirst) this.isFirst = false;
    },
    GetTermList() {
      this.session.swSearchPuList({
        iPosition: 0,
        iCount: 0,
        callback: (options, response, data) => {
          if (this.isFirst) {
            this.SetTreeData("_arr_pu");
          }
        }
      });
    },
    GetSession(callback) {
      let id = setInterval(() => {
        if (this.session != undefined) {
          clearInterval(id);
          callback();
        }
      }, 1000);
    }
  },
  watch: {
    "session._arr_pu_offline"(val) {
      console.log("Offline_Update");
      if (!this.isFirst) {
        this.SetTreeData("_arr_pu");
      }
    },
    "session._arr_pu_online"(val) {
      if (!this.isFirst) {
        this.SetTreeData("_arr_pu");
      }
    },
    Cb_isOnline(val){
      if (!this.isFirst) {
        this.CurrentPage = 1
        if(val){
          this.SetTreeData("_arr_pu_online");
        }else{
          this.SetTreeData("_arr_pu");
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
    console.log('created');
    this.GetTermList()
    this.session.swAddCallBack('pulist',(sender, cmd, data)=>{
      if(this.isFirst){
        this.GetTermList();
      }
    })
  }
};
</script>

<style lang="less">
#TermList {
  width: 100%;
  height: 100%;
  .el-loading-parent--relative{
    height: 100%;
  }
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
  
  .TreeList {
    width: 100%;
    height: calc(100% - 98px);
    padding-top: 5px;
    border-right: 1px solid #dcdfe6;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
    overflow: auto;
    .el-tree-node__content {
      height: 30px !important;
      font-size: 16px !important;
    }
  }
  div.Page {
    height: 30px;
    width: 100%;
    text-align: center;
    .el-pagination {
      display: inline-block;
    }
    // background-color: #ccc;
  }
}
</style>

