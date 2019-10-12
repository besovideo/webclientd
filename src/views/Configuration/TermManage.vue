<template>
  <div class="TermManage" id="ConfigureList" style="height:100%;width:100%">  
      <div class="left">
        <TermListVue key="TermListVue" :noShowChannel='true' @on-term-click='TermClickCb'/>
      </div>
      <div class="body">
        <header >
          <div class="h_left">
            <img :src="require('@/assets/images/shebeiguanli.png')" alt="">
            <p>{{$t('Data.shebeiguanli')}}</p>
            <p style="margin-left: 20px">{{CurrentPuId}}</p>
          </div>
          <div class="h_right">
          </div>
        </header>
        <div class="_content" style="height: calc(100% - 61px);">
          <TermInfoTableVue ref='TermInfo'/>
        </div>
      </div>
  </div>        
</template>

<script>
import TermListVue from '../../components/Configuration/TermManage/TermList.vue';
import TermInfoTableVue from '../../components/Configuration/TermManage/TermInfoTable.vue';

import {mapState} from 'vuex'
export default {
  components:{
    TermListVue,
    TermInfoTableVue,
    
  },
  data(){
    return{
      session:window._session,
      DataInfo:undefined,
      ShowInfo:false,
      CurrentPuId:''
    }
  },
  computed:{
    ...mapState({
      // session:'session'
    }),
  },
  methods:{
    TermClickCb(id,online){
      console.log('CB:'+id)
      this.CurrentPuId = id
       this.$store.state.ErrorCode = this.session.swGetPuDeviceInfo({
         puid:id,
         callback:(option,response,data)=>{
            if(response.emms.code!=0){
              this.$Message.error(this.$tools.findErrorCode(response.emms.code))
              return
            }
            this.DataInfo = data
            this.$refs['TermInfo'].SetData(this.DataInfo,online)
            this.$nextTick(()=>{
              this.ShowInfo = true
            })
         }
       })

    }
  }
  
}
</script>

<style lang="less">

</style>