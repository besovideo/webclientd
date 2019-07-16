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
    };
  },
  methods: {
    ChanelClick(channel){
      channel = channel._parent._arr_gps[0];
      channel.swOpen({
        callback: (options, response) => {
          let lat = response.gps.lat / 10000000;
          let long = response.gps.long / 10000000;
          // this.ChannelContent = true;
          this.position = [long, lat];
        } 
      });
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

