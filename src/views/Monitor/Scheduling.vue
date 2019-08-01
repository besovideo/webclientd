<template>
  <div class="content">
    <div class="left">
      <scheduling-tree-list key="LocateTree" :noShowChannel="true" @on-term-click='ChanelClick' @on-get-termgps='GetTermGps'/>
    </div>
    <div class="body">
      <Map :position="position"  key="LocateMap" :SchedulingList='GpsList' ref="Scheduling"/>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SchedulingTreeList from "@/components/Monitor/SchedulingTreeList.vue"
import Map from "@/components/Monitor/Map.vue"
export default {
  components:{SchedulingTreeList,Map},
  data() {
    return {
      position: [],
      openChannel:undefined,
      GpsList:undefined,
    };
  },
  methods: {
    GetTermGps(list){
      console.log('GetGps',list)
      this.GpsList = list
      this.$nextTick(()=>{
        this.$refs['Scheduling'].SetSchedulingMap()
      })
    },
    ChanelClick(channel){
      if(null == channel){
        this.$Message.error(this.$t("Monitor.noGPSChannel"))        
        return
      }
      if(channel._parent._arr_gps.length==0){
        this.$Message.error(this.$t("Monitor.noGPSChannel"))
        return
      }
      channel = channel._parent._arr_gps[0];
      if(channel!=this.openChannel){
        if(this.openChannel!=undefined){
          this.openChannel.swClose()
        }
        this.openChannel = channel
        let code = this.openChannel.swOpen({
          // interval:5000,
          // repeat:-1,
          callback: (options, response) => {
            
            let lat = response.gps.lat / 10000000;
            let long = response.gps.long / 10000000;
            // this.ChannelContent = true;
            this.position = [long, lat,this.openChannel];
          }
        })
        console.log(code)
        
      }
      // this.session.swAddCallBack("pugpsdata",(sender, cmd, data)=>{
      //   console.log(Math.random()," Math.random()")
      //   console.log("gps==========",sender,cmd,data);
      // })
    }
  },
  watch: {
    
  },
  computed: {
    ...mapState({
      session: "session"
    })
  },
  created() {
    // this.GetSession(() => {
    //   console.log(this.session);
    //   setTimeout(() => {
    //     this.GetTermList();
    //   }, 2000);
    // });
    // this.GetTermList(); 
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: calc(100% - 42px);
  display: flex;
  .left{
    width: 280px;
    height: 100%;
  }
  .body{
    flex:1;
    margin-left: 5px;
    height: 100%;
  }
  .el-tree-node>.el-tree-node__children{
    overflow: hidden!important;
  }
}
</style>

