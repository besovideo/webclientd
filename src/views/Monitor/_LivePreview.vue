<template>
  <div class="lp_content">
    <div class="lp_left">
      <term-tree-list key="LivePreviewTree" @on-click='ChanelClick'/>
    </div>
    <div class="lp_body">
      <div id="right_VideoContent">
        <div :style="videoboxclass"  v-for="(val,i) in videosize" >
          <video-box :tag="videoinfo[i].tag" :key="i" :noPlay="true" @on-open="openState" :puid="videoinfo[i].puid" :isopen='videoinfo[i].isopen' :tagEl="i" :ref="'video'+i"/>
        </div>
      </div>
      <div id="lp_right_bottom">
        <div class="rb_left">
          <!-- <Icon type="md-expand"  size='24' style="margin-top:3px" @click="FullScreen('#right_content')"/> -->
        </div>
        <div class="rb_right">
          <!-- <Dropdown
            trigger="hover"
            id="SetVideoNum"
            placement="top-start"
          >
            <a href="javascript:void(0)">
              <Icon type="ios-apps" size="24" style="line-height:30px"/>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem style="text-align:center" name="1">1x1</DropdownItem>
              <DropdownItem style="text-align:center" name="4">2x2</DropdownItem>
              <DropdownItem style="text-align:center" name="9">3x3</DropdownItem>
            </DropdownMenu>
          </Dropdown> -->
          <el-dropdown trigger="click" @command="DropdownClick">
            <span class="el-dropdown-link">
              <a href="javascript:void(0)">
                <Icon type="ios-apps" size="24" style="line-height:30px"/>
              </a>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="ivu-icon ivu-icon-ios-apps" command="1">1X1</el-dropdown-item>
              <el-dropdown-item icon="ivu-icon ivu-icon-ios-apps" command="4">2X2</el-dropdown-item>
              <el-dropdown-item icon="ivu-icon ivu-icon-ios-apps" command="9">3X3</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TermTreeList from "@/components/Monitor/TermTreeList.vue"
import VideoBox from "@/components/Monitor/VideoBox.vue";

export default {
  name: "livePreview",
  components: {
    TermTreeList,
    VideoBox
  },
  data() {
    return {
      CurrentPage: 1,
      PageSize: 100,
      Total: 100,
      tabs: "tissue",
      treeListModal: true,
      isOnline: false,
      videosize: 4,
      videoinfo:[],
      videoboxclass:{width:"50%",height:"50%",float:'left',border:"1px solid rgb(72, 123, 194)"},
      videoTarget: 0,
      tag: undefined,
      puid: undefined
    };
  },
  methods: {
    ChanelClick(channel,index) {
      let temp = this.videoinfo.filter((el,i)=>{
        return i<this.videosize && !el.isopen
      })
      if(temp.length>0){
        temp = temp[0]
      }else{
        this.$Message.info(this.$t("Monitor.Pleasecloseavideowindowfirst"))
        return;
      }
      temp.puid = channel._parent._id_pu;
      temp.tag = channel._id_chanel;
      // if((this.videoTarget+1)==this.videosize){
      //   this.videoTarget=0
      // }else{
      //   this.videoTarget++;
      // }
      // this.puid = channel._parent._id_pu;
      // this.tag = channel._id_chanel;
      return;
    },
    openState(i,status){
      this.videoinfo[i].isopen = status
    },
    DropdownClick(command){
      this.videosize = parseInt(command)
    }
  },
  watch: {
    tabs(val) {
      console.log(val);
    },
    videosize(val) {
      switch(val){
        case 1:
          this.videoboxclass = {width:"100%",height:"100%",border:"1px solid rgb(72, 123, 194)"}
          break
        case 4:
          this.videoboxclass = {width:"50%",height:"50%",float:'left',border:"1px solid rgb(72, 123, 194)"}
          break
        case 9:
          this.videoboxclass = {width:"33.333%",height:"33.333%",float:'left',border:"1px solid rgb(72, 123, 194)"}
          break
      }  
    },
  },

  computed: {
    ...mapState({
      session: "session"
    })
  },
  beforeDestroy() {
    // this.videoDivList.forEach(el => {
    //     if (el.chanel != undefined) {
    //       el.chanel.swClose({ hdlg: 1 });
    //     }
    //   });
  },
  mounted() {

  },
  created() {
    for(var i=0;i<9;i++){
      this.videoinfo.push({index:i,puid:undefined,tag:undefined,isopen:undefined})
    }
    this.session.swSearchPuList({
        iPosition: 0,
        iCount: 0,
        callback: (options, response, data) => {
          
        }
      });
  },
  updated() {
  }
};
</script>

<style lang="less" scoped>
.lp_content {
  width: 100%;
  height: calc(100% - 42px);
  display: flex;
  .lp_left{
    width: 255px;
    height: 100%;
  }
  .lp_body{
    flex:1;
    width: 100%;
    margin-left: 5px;
    height: 100%;
    display: block;
    #right_VideoContent{
      width: 100%;
      height: calc(100% - 30px);
      background-color: #ccc;
    }
    #lp_right_bottom{
      width: 100%;
      height: 30px;
      padding: 0 10px 0 0;
      height: 30px;
      background-color: rgb(47, 46, 56);
      .rb_left {
        height: 100%;
        float: left;
      }
      .rb_right {
        height: 100%;
        float: right;
      }
    }
  }
}
</style>


