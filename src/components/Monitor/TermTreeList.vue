<template>
  <div id="TermList">
    <Input class="search" @on-search="TermSearch" v-model="Search" search clearable placeholder />
    <div class="showonline">
      <Checkbox class="cb" v-model="Cb_isOnline">{{$t('Monitor.Showonlyonlinedevices')}}</Checkbox>
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
        :expand-on-click-node='false'
        @check="CheckTermBox"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }" >

          <!-- <el-tooltip  placement="right" :disabled="disabled" :transfer="true" effect="light" v-if="data.pu_id!=='0'">
            <template slot="content" >
              <div style="font-size:16px;margin-bottom:10px;" v-if="data.isChannel">{{ChanneTooltip}}</div>
              <div style="font-size:16px;margin-bottom:10px;" v-if="data.isTerm">{{TermTooltip}}</div>
              <div style="text-align:center">
                <el-link type="success" @click="$emit('on-tooltip-disabled')">{{$t('Data.buzaixianshi')}}</el-link>
              </div>
            </template> -->
            <span @dblclick="HandleChannelClick(data,node)" >
              <i v-if="node.label==''" class="el-icon-s-data" style="padding-right:5px;"></i>
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
                <!-- @dblclick.stop.prevent="HandleTreeClick(data,node)" -->
              
                <span
                  slot="reference" 
                  class="unselectable TermTree"
                  
                  :puid="data.pu_id"
                  :style="{color:data.isOnline==0?'#ccc':'inherit',paddingLeft:10}"
                >{{ node.label }}</span>
              <span class="pu_id" v-if="data.isTerm" :title="data.pu_id.slice(3)">
                <!-- {{node.label==node.pu_id?"":`(${node.pu_id})`}} -->
                ({{data.pu_id.slice(3)}})
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
        :pager-count="5"
        @current-change="ChangePage"
      ></el-pagination>
    </div>
    <!-- 分页 -->
    
    <div v-if="contextMenuVisible" @click="contextMenuVisible=false"  @contextmenu.stop.prevent="contextMenuVisible=false" style="background:rgba(0,0,0,0);position: fixed;width:100%;height:100%;top:0;left:0;z-index: 998">
    </div>

      <context-menu class="right-menu" 
        :target="$refs.treeTerm" 
        :show="contextMenuVisible"
        >
        <!-- @update:show="(show) => contextMenuVisible = show"> -->
        <ul class="rightMenu-ul" v-for="item in this.$store.state.locateCheckData[rigthClickPuID]"> 
          <li>
            <i v-if="item.isChecked" class="el-icon-check"/>
            <a href="javascript:;" 
              @click="SetRightMenuVal(item)">{{item.label}}</a></li>
        </ul>
      </context-menu>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { component as VueContextMenu } from '@xunlei/vue-context-menu'
export default {
  props: ["noShowChannel","TermTooltip","ChanneTooltip"], // 'disabled'
  components:{
    'context-menu': VueContextMenu
  },
  data() {
    return {
      VideoState: require("@/assets/images/video2.png"),
      VideoErrorState: require("@/assets/images/video2-error.png"),
      ChannelUrl: require("@/assets/images/channel.png"),
      Cb_isOnline: true,
      TreeLoading: true,
      contextMenuVisible:false,
      isFirst: true,
      NameSearch: "",
      NameSelect: "1",
      TypeSelect: "1",
      CurrentPage: 1,
      Total: undefined,
      Search: "",
      SearchStatus: undefined,
      allCheckedTerm:[],
      rigthClickPuID:undefined,
      locateCheckData:{
      },
      TermListData: [
        {
          label: this.$t("Monitor.Server"),
          pu_id: '0',
          key: '0',
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
    SetRightMenuVal(item){
      console.log('item.key :',item.key,item.isChecked);
      this.contextMenuVisible = false
      let clickID = this.rigthClickPuID + '';
      this.$set(item,'isChecked',!item.isChecked)
      if(item.key == 'guiji' && item.isChecked) {
        let Weizhi = this.$store.state.locateCheckData[this.rigthClickPuID][0]
        if(!Weizhi.isChecked){
          Weizhi.isChecked = true

          this.$emit('on-check-term',clickID,'weizhi',item.isChecked)
        }
      } 
      this.$emit('on-check-term',clickID,item.key,item.isChecked)
    },
    BoxRightClick(e){
      
      // let div = document.querySelector('.TermTree')
      if(e.target.classList.contains('TermTree') && this.noShowChannel ){
        this.rigthClickPuID = e.target.getAttribute('puid')
        let PuIdData = this.TermListData[0].children.find(el=>el.pu_id == this.rigthClickPuID)
        if(!PuIdData.isOnline){
          return
        }
         
        if(!this.$store.state.locateCheckData[this.rigthClickPuID]){
          this.$set(this.$store.state.locateCheckData,this.rigthClickPuID,[
            {
              label: this.$t('Data.xianshishishiweizhi'),
              isChecked: false,
              key: 'weizhi'
            },
            {
              label: this.$t('Data.xianshiguiji'),
              isChecked: false,
              key: 'guiji'
            }
          ])
        }
        this.contextMenuVisible = true
      }else{
        this.contextMenuVisible = false
      }
    },
    CheckTermBox(self,allCheckedNodes){
      let check = allCheckedNodes.checkedKeys
      this.allCheckedTerm = check

      console.log(self,allCheckedNodes)
      if(self.pu_id=='0'){
        
        return
      }
      
      // if(check.findIndex(el=>el==self.pu_id)==-1){
      //   this.$emit('on-check-term','remove',[self.pu_id])
      // }else{
      //   this.$emit('on-check-term','add',[self.pu_id])
      // }
      

    },
    TermSearch(val,page) {
      console.log(val);
      let isOnline = this.Cb_isOnline
      let code = this.session.swSearchPuList({
        iPosition: page==undefined?0:page,
        iCount: 100,
        stFilter: {
          iOnlineStatus: isOnline?1:0,
          iTimeBegin: 0,
          iTimeEnd: 0,
          szIDOrName: val
        },
        callback: (options, response, data) => {

          // let term = this.session.swGetPu(val);
          if (data.puList.length == 0) {
            this.$Message.error(this.$t("Monitor.noTerm"));
            return;
          }
          console.log('search',data);
          this.CurrentPage = page==undefined?1:(page+1);
          this.Total = data.info.itotalcount;
          this.Search2SetData(data);
          return;
        }
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
        this.$Message.error(this.$t('Data.shebeiyilixian'));
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
      if(this.SearchStatus){
        this.TermSearch(this.Search,page-1)
        return
      }
      this.GetTermList(page - 1, 100, this.Cb_isOnline);
    },
    Search2SetData(data) {
      let temp = [];
      this.SearchStatus = true;
      data.puList.forEach((ele, i) => {
        let children = [];
        if(!this.noShowChannel){
          ele._arr_channel.forEach((el, i) => {
            children.push({
              label: this.$t("Monitor.channel") + i,
              index: i,
              pu_id: el._id_pu,
              isChannel: true
            });
          });
        }
        temp.push({
          label: ele._name_pu || ele._id_pu,
          pu_id: ele._id_pu,
          isTerm: true,
          isOnline: ele._info_pu.onlinestatus,
          children
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
      if(this.CurrentPage > Math.ceil(this.session[name].length / 100)){
        CurrentPage =  Math.ceil(this.session[name].length / 100)
      }

      let temp = [];
      if (name == "_arr_pu") {
        let num = [];
        if (
          (CurrentPage - 1) * 100 <
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
        // this.Total = this.session[name].length;
        if (
          i >= (CurrentPage - 1) * 100 &&
          i < (CurrentPage - 1) * 100 + 100
        ) {
          let children = [];
          if (this.noShowChannel) {
          } else {
            ele._arr_channel.forEach((el, i) => {
              if (ele._info_pu.onlinestatus != 0)
                children.push({
                  label: this.$t("Monitor.channel") + i,
                  index: i,
                  pu_id: ele._id_pu,
                  isChannel: true
                });
            });
          }
          temp.push({
            label: ele._name_pu || ele._id_pu,
            pu_id: ele._id_pu,
            isTerm: true,
            pu_info: ele._info_pu,
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

      
      let giveLocateOnlineTerm = []
      let SortTemp = [];
      temp.forEach(el => {
        if (el.isOnline) {
          SortTemp.unshift(el);
          giveLocateOnlineTerm.push(el)
        } else {
          SortTemp.push(el);
        }
      });
      


      this.$set(this.TermListData[0], "children", []);
      this.$set(this.TermListData[0], "children", SortTemp);
      if (document.querySelector(".TreeList"))
        document.querySelector(".TreeList").scrollTop = 0;
      this.TreeLoading = false;
      if (this.isFirst) {
        // giveLocateOnlineTerm.forEach(item=>{
          
        // })
        this.$emit('on-online-term',giveLocateOnlineTerm)
        this.isFirst = false;
      }

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
      let code = undefined
      this.$store.state.ErrorCode = code = this.session.swSearchPuList({
        iPosition: page * 100,
        iCount: pagesize,
        stFilter: {
          iOnlineStatus: isOnline ? 1 : 0,
          iTimeBegin: 0,
          iTimeEnd: 0
        },
        callback: (options, response, data) => {
          // debugger
          this.$store.state.ErrorCode = response.emms.code 
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
        }
      });
    },
    initLocateCheckData(data){
      for(let key in data){
        data[key].forEach(el=>{
          this.$emit('on-check-term',key,el.key,el.isChecked)
        })
      }
    }
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
    Cb_isOnline(val) {
      if(val == true) {
        localStorage.setItem('cb_online',val)
      }else {
        localStorage.removeItem('cb_online')
      }
      // if (!this.isFirst) {
        if(this.SearchStatus){
          this.TermSearch(this.Search,0)
        }else{
          this.GetTermList(0, 100, val);
        }
      // } 
    }
  },
  computed: {
    ...mapState({
      session: "session",
      notify: "notify"
    })
  },
  mounted(){
    this.initLocateCheckData(this.$store.state.locateCheckData)
  },
  created() {
    console.log("created");
    console.log(this.session);
    console.log('this.$store.state.locateCheckData ',this.$store.state.locateCheckData);
    
    if(localStorage.getItem('cb_online',undefined)) {
      this.Cb_isOnline = true
      this.GetTermList(0, 100, true);
      return 
    }

    this.Cb_isOnline = false

    this.GetTermList(0, 100, false);
    

  }
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
    box-shadow: 0 .5em 1em 0 rgba(0,0,0,.1);
    border-radius: 1px;
    z-index: 999;
    display: none;
    > .rightMenu-ul {
      &:nth-child( n+2 ){
        border-top: 1px solid #ccc;
      }
      li {
        padding-left: 24px;
        position: relative;
        height: 28px;
        background-color: rgba(110, 107, 107, 0.2);
        >i{
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
    }
}

.right-menu a {
    // width: 100px;
    height: 28px;
    background: #fff;
    line-height: 20px;
    text-align: left;
    display: block;
    color: #1a1a1a
}

.right-menu a:hover {
    background: #eee;
    color: #fff
}

body,html {
    height: 100%
}



.rightMenu-ul

a {
    text-decoration: none
}

.right-menu a {
    padding: 5px
}

.right-menu a:hover {
    background: #42b983
}

</style>

