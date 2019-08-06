<template>
  <div class="content">
    <div class="left">
      <term-tree-list key="LocateTree" :noShowChannel="true" @on-term-click='ChanelClick'/>
    </div>
    <div class="body">
      <Map :position="position"  key="LocateMap" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import TermTreeList from "@/components/Monitor/TermTreeList.vue"
import Map from "@/components/Monitor/Map.vue"
export default {
  components:{TermTreeList,Map},
  data() {
    return {
      position: [],
      openChannel:undefined
    };
  },
  methods: {
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
        let code = undefined
        this.$store.state.ErrorCode = code = this.openChannel.swOpen({
          // interval:5000,
          // repeat:-1,
          callback: (options, response) => {
            this.$store.state.ErrorCode = response.emms.code
            if(response.gps.lat==0&&response.gps.long==0){
              this.$Message.error(this.$t("Monitor.GPSLocationError"))
              return
            }
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
    width: 255px;
    height: 100%;
  }
  .body{
    flex:1;
    margin-left: 5px;
    height: 100%;
  }
}
</style>

