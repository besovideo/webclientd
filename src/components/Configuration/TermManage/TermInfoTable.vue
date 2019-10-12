<template>
  <div v-if="DataInfo" id="TermInfoList" style="height:100%">
      <el-tabs type="border-card" style="height: 100%">
        <el-tab-pane :label="$t('Data.jibenxinxi')">
          <div class="info_left" :style="{width:'50%',float:'left'}">
              <h1>{{$t('Data.yingjian/ruanjianxinxi')}}</h1>
              <PrimaryInfoList :label='$t("Data.zhizaoshang")'> 
                <el-input v-model="DataInfo.szManufacturer" :disabled="true" />
              </PrimaryInfoList>
              <!-- <div class="term_list">
                <p class="itemleft">
                  <el-tag type="success">制造商</el-tag>
                </p>
                <p class="itemright">
                </p>
              </div> -->
              
              <PrimaryInfoList :label='$t("Data.shebeixinghao")'>
                <el-input v-model="DataInfo.szProductName" :disabled="true" />
              </PrimaryInfoList>
              <PrimaryInfoList :label='$t("Data.ruanjianbanben")'>
                <el-input v-model="DataInfo.szSoftwareVersion" :disabled="true" />
              </PrimaryInfoList>
              <PrimaryInfoList :label='$t("Data.yingjianbanben")'>
                <el-input v-model="DataInfo.szHardwareVersion" :disabled="true" />
              </PrimaryInfoList>
              <PrimaryInfoList :label='$t("Data.shebeiID")'>
                <el-input v-model="DataInfo.szID" :disabled="true" />
              </PrimaryInfoList>
              <PrimaryInfoList :label='$t("Data.shebeiming")'>
                <el-input v-model="DataInfo_name" />
              </PrimaryInfoList>
              <PrimaryInfoList :label='$t("Data.lanyadizhi")'>
                <el-input v-model="DataInfo.szBluetoothAddr" :disabled="true" />
              </PrimaryInfoList>
              <PrimaryInfoList :label='$t("Data.yuyan")'>
                  <el-select v-model="DataInfo.languageSelected">
                    <el-option :key="item" v-for="item in DataInfo.languages" :value="item" :label="item | languages">{{item | languages}}</el-option>
                  </el-select>
              </PrimaryInfoList>
              <el-button style="margin-left:90px" type="primary" size="small" @click="UpdateDataInfo">{{$t('Data.xiugai')}}</el-button>
              <el-button style="margin-left:10px" type="primary" :disabled="!online" size="small" @click="Reboot(0)">{{$t('Data.zhongqishebei')}}</el-button>
          </div>
          <div class="info_right"  v-if="online" :style="{width:'50%',float:'right'}">
            <h1>{{$t('Data.zaixianxinxi')}}</h1>
            <PrimaryInfoList :label='$t("Data.kaijishijian")'>
              <el-input v-model="bootTime" :disabled="true" />
            </PrimaryInfoList>
            <PrimaryInfoList :label='$t("Data.shangxianshijian")'>
              <el-input v-model="onlineTime" :disabled="true" />
            </PrimaryInfoList>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('Data.qitaxinxi')" class="OtherInfo">
          <PrimaryInfoList :label='$t("Data.WIFIshumu")'>
            <el-input v-model="DataInfo.iWIFICount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.wuxianmokuaishumu")'>
            <el-input v-model="DataInfo.iRadioCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.yinshipintongdaoshu")'>
            <el-input v-model="DataInfo.iChannelCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.shipinshurushu")'>
            <el-input v-model="DataInfo.iVideoInCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.yinpinshurushu")'>
            <el-input v-model="DataInfo.iAudioInCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.yinpinshuchushu")'>
            <el-input v-model="DataInfo.iAudioOutCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.PTZshu")'>
            <el-input v-model="DataInfo.iPTZCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.PTZyuzhidianshumu")'>
            <el-input v-model="DataInfo.iPresetCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.PTZxunhangdianshumu")'>
            <el-input v-model="DataInfo.iCruiseCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.chuankoushu")'>
            <el-input v-model="DataInfo.iSerialPortCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.baojingshurushu")'>
            <el-input v-model="DataInfo.iAlertInCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.baojingshuchushu")'>
            <el-input v-model="DataInfo.iAlertOutCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.cunchushebeishu")'>
            <el-input v-model="DataInfo.iStorageCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.GPSshebeishu")'>
            <el-input v-model="DataInfo.iGPSCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.shoujiduanxingongneng")'>
            <el-input v-model="DataInfo.iGPSCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.baojingliandongshumu")'>
            <el-input v-model="DataInfo.iAlarmLinkActionCount" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.jingdu")'>
            <el-input v-model="DataInfo.iLongitude" :disabled="true" />
          </PrimaryInfoList>
          <PrimaryInfoList :label='$t("Data.weidu")'>
            <el-input v-model="DataInfo.iLatitude" :disabled="true" />
          </PrimaryInfoList>
        </el-tab-pane>
      </el-tabs> 
  </div>  
</template>
<script>
import {mapState} from 'vuex'
import PrimaryInfoList from './PrimaryInfoList.vue';

export default {
  components:{PrimaryInfoList},
  data(){
    return{
      DataInfo:undefined,
      online:undefined,
      PuData:undefined
    }
  },
  computed:{
    ...mapState({
      session: 'session',
      lang: 'lang',
      notify: 'notify',
    }),
    DataInfo_name:{
      get(){
        return this.DataInfo.szName||this.DataInfo.szID
      },
      set(val){
        this.DataInfo.szName = val
      }
    },
    bootTime(){
      if(!this.PuData)return ''
      let {day,hour,minute,month,second,year} = this.PuData._info_pu.boottime
      return  this.$tools.utc2beijing(`${year}/${month}/${day} ${hour<10?'0'+hour:hour}:${minute<10?'0'+minute:minute}:${second<10?'0'+second:second}`)
    },
    onlineTime(){
      if(!this.PuData)return ''
      let {day,hour,minute,month,second,year} = this.PuData._info_pu.onlinetime
      return  this.$tools.utc2beijing(`${year}/${month}/${day} ${hour<10?'0'+hour:hour}:${minute<10?'0'+minute:minute}:${second<10?'0'+second:second}`)
    }
  },
  watch:{
    notify(val){
      if(!this.DataInfo)return
      if(val.content._id_pu==this.DataInfo.szID){
        val.onlinestatus?this.online = true:this.online = false
      }
    },
    online(newVal,old){
      if(!this.DataInfo)return
      if(old==false){
        let puInfo = this.session.swGetPu(this.DataInfo.szID)
        this.PuData = puInfo
      }
    }
  },
  filters:{
    languages(val,type){
      let lang = localStorage.getItem('locale')
      switch(val){
        case 'ENGLISH':
          if(lang=='zh'){
            return '英文'
          }
          break
        case "CHINESE_SIMPLIFIED":
          if(lang=='zh'){
            return '简体中文'
          }
          break
        case "CHINESE_TRADITIONAL":
          if(lang=='zh'){
            return '繁体中文'
          }
          break
        default:
          return val
      }
      return val
    }
  },
  methods:{
    Reboot(target){
      this.PuData.swPuControl({
        ioption:target,
        callback:(option,response,data)=>{
          if(response.emms.code!=0){
            this.$Message.error(this.$tools.findErrorCode(response.emms.code))
            return
          }
          this.$Message.success(this.$t('Data.zhongqichenggong'))
        },
      })
    },
    // 应用 按钮逻辑
    UpdateDataInfo(){
      let languageIndex = this.DataInfo.languages.findIndex(el=>el==this.DataInfo.languageSelected)
      this.session.swSetPuDeviceInfo({
        puid: this.DataInfo.szID,
        ilanguage: languageIndex,
        name: this.DataInfo.szName,
        callback:(option,response,data)=>{
            if(response.emms.code!=0){
              this.$Message.error(this.$tools.findErrorCode(response.emms.code))
              return
            }
            this.$Message.success(this.$t('Data.xiugaichenggong'))

            // this.DataInfo.szName = this.DataInfo_name
        },
        tag:null
      })
    },
    // 父组件调用设置数据
    SetData(data,online){
      console.log('Cb：',data);
      this.DataInfo = data

      let puInfo = this.session.swGetPu(data.szID)
      console.log('PuInfo: ',puInfo)
      this.PuData = puInfo

      online==0?this.online=false:this.online=true
    }
  },
  created(){
  }
}
</script>
<style lang="less">
.info_left,.info_right{
  h1 {
    margin:0 0 15px 20px;
  }
}

#TermInfoList {
  .el-tabs.el-tabs--top.el-tabs--border-card{
    height: 100%;
    .el-tabs__content{
      height: calc(100% - 39px);
      overflow: auto;
    }
  }
  .OtherInfo{
    .itemleft{
      min-width: 120px;
    }
  }

}
// .term_list{
//   margin-bottom: 10px;
//   width:100%;
//   display: flex;
//   .itemleft{
//     min-width:80px;
//     text-align: right;
//     // padding-right: 10px; 
//     margin-right: 10px
//   }
//   .itemright{
//     flex:1;
//     &>.el-input>input,textarea{
//       height:32px;
//       cursor:initial;
//     }
//     &>.el-select input{
//       height: 32px;
//     }
//     .el-input__icon{
//       line-height: 32px;
//     }
//   }
// }
</style>