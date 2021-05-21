<template>
  <div class="content">
    <div class="left">
      <term-tree-list
        ref="LocateTree"
        key="LocateTree"
        :disabled="disabled"
        :ChanneTooltip="''"
        :TermTooltip="$t('Data.shuangjidakaishebeidingwei')"
        @on-tooltip-disabled="DontShowTooltip"
        @on-online-term="GetOnlineTerm"
        @on-check-term="OnCheckTerm"
        :showLocateMenu="true"
        :show-menu="true"
        @on-term-click='ChanelClick'/>
    </div>
    <div class="body">
      <Map :position="position" key="LocateMap" ref='LocateMap' />
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
      openChannel:undefined,
      GpsList:undefined,
      tooltip: false,
      disabled: false,
    };
  },
  methods: {
    OnCheckTerm(_pu_id,tag,isChecked){
      console.log('pu_id:',_pu_id)
      console.log('tag:',tag)
      console.log('isChecked:',isChecked)
      let pu_id = _pu_id
      if(isChecked && tag=='guiji') {
        setTimeout(() => {
          this.$refs['LocateMap'].SetPu2LocateTerms(pu_id,tag,isChecked?'add':'remove')
        }, 2000);
        return
      }
      this.$refs['LocateMap'].SetPu2LocateTerms(pu_id,tag,isChecked?'add':'remove')
    },
    DontShowTooltip(){
      this.disabled = true
      localStorage.setItem('localeDisabled',true)
    },
    GetOnlineTerm(termList){
      console.log('OnlineList',termList)
      // let temp = []
      // termList.forEach(el => {
      //   console.log(el);
      //   let gps = this.session.swGetPuChanel(el.pu_id, 65536);
      //   if (gps == null) {
      //     return;
      //   }
      //   temp.push(gps);
      // });
      // this.GpsList = temp
      // this.$nextTick(()=>{
      //   this.$refs['LocateMap'].SetLocateAllTerm()
      // })
      let temp = []
      termList.forEach(el=>{
        temp.push({
          'pu_id':el.pu_id,
          'pu_info': el.pu_info
        })
      })
      this.$refs['LocateMap'].SetLocateAllTerm(temp)
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

      if(channel._parent._info_pu.onlinestatus==1)
        this.$refs['LocateMap'].ShowOneMarker(channel._parent._id_pu)
      else
        return

      // channel = channel._parent._arr_gps[0];
      // if(channel!=this.openChannel){
      //   if(this.openChannel!=undefined){
      //     this.openChannel.swClose()
      //   }
      //   this.openChannel = channel
      //   let code = undefined
      //   this.$store.state.ErrorCode = code = this.openChannel.swOpen({
      //     callback: (options, response) => {
      //       this.$store.state.ErrorCode = response.emms.code
      //       if(response.gps.lat==0&&response.gps.long==0){
      //         this.$Message.error(this.$t("Monitor.GPSLocationError"))
      //         return
      //       }
      //       let lat = response.gps.lat / 10000000;
      //       let long = response.gps.long / 10000000;
      //       this.position = [long, lat,this.openChannel];
      //     }
      //   })
      //   console.log(code)
      // }

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
    this.disabled = localStorage.getItem('localeDisabled') == null ? false:true
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

