<template>
  <div id="TermList">
    <Input class="search" @on-search="TermSearch" v-model="Search" search clearable placeholder />
    <!-- <div class="showonline">
      <Checkbox class="cb" v-model="Cb_isOnline">{{$t('Monitor.Showonlyonlinedevices')}}</Checkbox>
    </div> -->
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
          <span class="pu_id" v-if="data.isMeeting">
            <!-- {{node.label==node.pu_id?"":`(${node.pu_id})`}} -->
            {{ (data.id==undefined) ?"":`(${data.id.slice(5)})` }} 
          </span>
          <span class="pu_id" v-if="data.isPerson">
            <!-- {{node.label==node.pu_id?"":`(${node.pu_id})`}} -->
            {{ (data.id==undefined) ?"":(data.id.slice(3).length>0?`(${data.id.slice(3)})`:"") }} 
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
      MeetingState: require("@/assets/images/meeting.png"),
      Person0: require("@/assets/images/person0.png"),
      Person1: require("@/assets/images/person1.png"),
      Speak: require("@/assets/images/speak.png"),
      Listening: require("@/assets/images/listening.png"),
      Personexit: require("@/assets/images/Personexit.png"),
      TermGpsList:[],
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
              label: "会议",
            }
          ]
        }
      ]
    };
  },
  methods: {
    TermSearch(val,page) {
      
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
      
    },
    ChangePage(page) {
      
    },
    SetMeetingData(data) {
      let temp = [];
      let gpsterm = new Set();
      data.forEach((ele, i) => {
        let children = [];

        if(ele._conf_particulars.length>0){
          ele._conf_particulars.forEach((el,i)=>{
            if(el.id.indexOf("PU")!=-1){
              gpsterm.add(el.id)
            }
            children.push({
              label: el.aliasname || el.name,
              id: el.id,
              isPerson: true,
              addr:el.addr,
              pid:el.pid,
              isOnline:el.isonline,
              isadmin:el.isadmin,
              isinseat:el.isinseat,
              isleave:el.isleave,
              isSpeak:el.isSpeak
            });
          })
        }
        temp.push({
          label: ele._conf_base_info.name,
          id: ele._conf_base_info.id,
          isMeeting: true,
          children
        })
      });
      
      this.$set(this.TermListData[0], "children", []);
      this.$set(this.TermListData[0], "children", temp);
      this.TreeLoading = false;

      //获取设备GPS并显示
      gpsterm.forEach(el=>{
        let gps = this.session.swGetPuChanel(el,65536);
        if(gps==null){
          return
        }
        this.TermGpsList.push(gps)
      })
      this.$emit("on-get-termgps",this.TermGpsList);

      console.log(this.TermGpsList);


    },
    SetWatch(sender, event, data){
      console.log(sender, event, data);
      switch(event){
        case "notifybaseinfo":
          this.SetConfInfo(data.conf,data.data)
          break
        default:
          this.SetTermStatus(data.conf,data.data)
          break
      }
    },
    SetConfInfo(conf,data){
      let Conf = this.TermListData[0].children.filter(el=>el.id==data)
      if(Conf.length==0){
        return
      }
      //修改会议名称
      Conf[0].label = conf._conf_base_info.name
    },
    SetTermStatus(conf,data){
      let Conf = this.TermListData[0].children.filter(el=>el.id==conf._conf_base_info.id)
      if(Conf.length==0){
        return
      }
      if(data.__proto__.constructor == Array){
        data.forEach(el=>{
          this.SetTermStatus(conf,el)
        })
        return
      }
      let Term = Conf[0].children.filter(el=>el.id==data.id)
      if(Term.length==0)return
      let temp = {
        label: data.aliasname || data.name,
        id: data.id,
        isPerson: true,
        addr:data.addr,
        pid:data.pid,
        isOnline:data.isonline,
        isadmin:data.isadmin,
        isinseat:data.isinseat,
        isleave:data.isleave,
        isSpeak:data.isSpeak
      }

        for (let obj in temp) {
          Term[0][obj] = temp[obj]
        }

        console.log('Over');
    }
  },
  filters:{
    Status:function(value){
      
      if(!value.isOnline){
        return require("@/assets/images/person0.png")
      }
      if(value.isSpeak){
        return require("@/assets/images/speak.png")
      }
      if(value.isinseat){
        return require("@/assets/images/listening.png")
      }
      if(value.isleave){
        return require("@/assets/images/Personexit.png")
      }
      if(value.isOnline){
        return require("@/assets/images/person1.png")
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
        if(this.SearchStatus){
          this.TermSearch(this.Search,0)
        }else{
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
      callback:(code)=>{
        console.log('会议初始化:',code);
        let list = SwConfManager.swGetConfList()
        console.log('会议列表',list);
        this.SetMeetingData(list);
        SwConfManager.swRegConfWatch((sender, event, data) => {
          this.SetWatch(sender, event, data)
        });
        // list[0].swGetParticularList({
        //   callback:(options,response,data)=>{
        //     this.TreeLoading = false
        //     console.log(options,response,data);
        //   }
        // })
      }
    })
  }
};
</script>

<style lang="less">

</style>

