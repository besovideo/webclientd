<template>
  <!-- <div id="container" v-loading="loading" @mousemove="MouseMove($event)"> -->
  <div id="container" v-loading="loading">
    <div id="_container"></div>
    <Modal footer-hide v-model="VideoModal" draggable scrollable>
      <p slot="header" style="color:#000;text-align:center">
        <span>{{ $t("Monitor.LiveVideo")}}</span>
      </p>
      <div style="text-align:center;height:500px;">
        <video-box v-if="VideoModal" :VideoTypeSetting='true' :tag="tag" :puid="puid" :puname="puname" :tagEl="tagEl" />
      </div>
      <!-- <div slot="footer">
        <Button type="error" size="large" long >Delete</Button>
      </div>-->
    </Modal>

    <Modal footer-hide v-model="SpeakModal" width="300" height="300" draggable scrollable>
      <p slot="header" style="color:#000;text-align:center">
        <span>{{ $t("Monitor.Intercom")}}</span>
      </p>
      <!-- <div style="text-align:center; cursor: pointer" class="SpeakDiv" @contextmenu.prevent='' @mousedown="OpenSpeak"  @mouseup="OpenSpeak"> -->
      <div style="text-align:center; cursor: pointer" class="SpeakDiv" @click="OpenSpeak" >
        <img
          @dragstart.prevent=""
          @contextmenu.prevent=""
          :src="this.StartMode?require('@/assets/images/duijian_0.png'):require('@/assets/images/duijian.png')"
          width="200"
          style="display:block;margin: 20px 34px; cursor: pointer"
        />
        <p
          v-if="!this.StartMode"
          style="text-align: center;height: 30px;font-size: 20px;line-height:30px;color: rgb(18, 150, 219);"
        >{{$t('Data.dianjiduijiang')}}</p>
        <p
          v-if="this.StartMode"
          style="text-align: center;height: 30px;font-size: 20px;line-height:30px;color: red;"
        >{{$t('Data.guanbiduijiang')}}</p>
      </div>
      <!-- <div slot="footer">
        <Button type="error" size="large" long >Delete</Button>
      </div>-->
    </Modal>
  </div>
</template>

<script>
import VideoBox from "../../components/Monitor/VideoBox.vue";
import { mapState } from "vuex";
export default {
  components: { VideoBox },
  props: ["position", "SchedulingList","target"],
  data() {
    return {
      loading: false,
      map: undefined,
      isFirst: true,
      VideoModal: false,
      tag: undefined,
      tagEl: undefined,
      puid: undefined,
      puname: undefined,
      IntervalGetGpsID: undefined,
      SpeakModal: false,
      StartMode: false,
      LocateTerms: [],
      complete_job: [],
      zindex:1,
    };
  },
  watch: {
    position(val, oldVal) {
      if (oldVal[2] != val[2]) {
        this.VideoModal = false;
        this.SpeakModal = false;
      }
      this.SetMap();
    },
    notify(val){

      if(val.onlinestatus === 0 ){
        let index = this.LocateTerms.findIndex(el=>el.pu_id == val.content._id_pu)
        if(index==-1)return

        if(this.LocateTerms[index].timer) {
          clearInterval(this.LocateTerms[index].timer)
        }
        if(this.LocateTerms[index].marker){
          this.LocateTerms[index].marker.infoWindow.close()
          this.map.remove(this.LocateTerms[index].marker)
        }

        if(this.LocateTerms[index].Polyline){
          this.LocateTerms[index].ShowLocus = false
          this.map.remove(this.LocateTerms[index].Polyline)
          this.LocateTerms[index].LocusPath = undefined
        }
        // if(this.LocateTerms[index].ShowLocus) {
        //   this.LocateTerms[index].ShowLocus = false
        //   this.LocateTerms[index].LocusPath = undefined
        // }

        this.LocateTerms.splice(index,1)
      }else{
        let temp = {}
        temp['pu_id'] = val.content._id_pu
        temp['pu_info'] = val.content._info_pu
        let PuCheckInfo = this.$store.state.locateCheckData[val.content._id_pu]
        
        if(PuCheckInfo){
          setTimeout(() => {
            this.SetPu2LocateTerms(val.content._id_pu,PuCheckInfo[0]['key'],PuCheckInfo[0].isChecked?'add':'remove')
            setTimeout(() => {
              this.SetPu2LocateTerms(val.content._id_pu,PuCheckInfo[1]['key'],PuCheckInfo[1].isChecked?'add':'remove')        
            }, 2000);      
          }, 1000);
          
        }
        this.SetPuInfoLatLon2Marker(temp)

      }

      if(val==undefined && !this.StartMode)
        return
      if(this.puid == val.content._id_pu){
        if(!this.$store.state.notifyTip[this.puid]){
          this.$Message.error(this.$t('Data.shebeiyilixian'))
          this.OpenSpeak()
          this.SpeakModal = false
          this.$store.state.notifyTip[this.puid] = true
        }
        
      }

    }
  },
  computed: {
    ...mapState({
      session: "session",
      notify: "notify"
    })
  },
  methods: {
    Marker2Top(e) {
      
      document.querySelectorAll(".amap-marker").forEach((item)=>{
        item.classList.remove('marker_top')
      })
      const target = e.target.getContentDom();
      if(e.target.getContentDom()) {

        target.parentElement.classList.add('marker_top')
      }
    },
    async SetPu2LocateTerms(pu_id,tag,isChecked){
      console.log(pu_id)
      if(!this.map){
        this.complete_job.push(()=>{
          if(isChecked=='add'){
            this.SetPu2LocateTerms(pu_id,tag,isChecked)
          }
        })
        return
      }
      let index = this.LocateTerms.findIndex(el=>el.pu_id == pu_id)
      if(tag == 'weizhi'){
        if(isChecked=='add'){
          let temp = {pu_id};
          if(index!=-1){
            // if(this.LocateTerms[index].timer!=undefined){
            //   return
            // }
            temp = this.LocateTerms[index]
            if(temp.marker){
              temp.marker.setMap(null)
              temp.marker.infoWindow && temp.marker.infoWindow.close()
              temp.marker = undefined
            }   
          }
          // this.session.swGetPuChanel(temp.pu_id, 65536).swClose()
          let gps = this.session.swGetPuChanel(temp.pu_id, 65536);
          if (gps == null) {
            this.$store.state.locateCheckData[pu_id].forEach(setting => {
              setting.isChecked = false
            })
            return
          }

          // if(!await this.GetGPSValid(gps)){
          //   this.$Message.error(this.session.swGetPu(pu_id)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
          //   console.log(this.$store.state.locateCheckData[pu_id])
          //   this.$store.state.locateCheckData[pu_id].forEach(setting => {
          //     setting.isChecked = false
          //   })
          //   return
          // }

          const result = await this.SetMarkerToMap(gps,temp)
          if(!result) {
            this.$Message.error(this.session.swGetPu(pu_id)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
            console.log(this.$store.state.locateCheckData[pu_id])
            this.$store.state.locateCheckData[pu_id].forEach(setting => {
              setting.isChecked = false
            })
            return
          }

          this.map.setFitView([temp.marker],false,undefined,this.map.getZoom())


          temp['timer'] = setInterval(async ()=>{ await this.SetMarkerToMap(gps,temp)},5000)

          if(index==-1){
            this.LocateTerms.push(temp)
          }

        }else{
          
          if(index==-1) {
            console.log(this.$store.state.locateCheckData[pu_id])
            this.$store.state.locateCheckData[pu_id].forEach(setting => {
              setting.isChecked = false
            })
            return
          }
          if(this.LocateTerms[index].timer==undefined){
            console.log(this.$store.state.locateCheckData[pu_id])
            
            return
          }
          let lastGpsData = this.LocateTerms[index].lastGpsData
          clearInterval(this.LocateTerms[index].timer)
          this.SetPuInfoLatLon2Marker({pu_id,lastGpsData})
          if(this.LocateTerms[index].marker){
            this.LocateTerms[index].marker.infoWindow.close()
            this.map.remove(this.LocateTerms[index].marker) 
            this.LocateTerms[index].marker = undefined
          }
        }
      }else if(tag == 'guiji') {
        if(index==-1) {
          console.log(this.$store.state.locateCheckData[pu_id])
          this.$store.state.locateCheckData[pu_id].forEach(setting => {
            setting.isChecked = false
          })
          return
        }

        let temp = this.LocateTerms[index]

        if(isChecked=='add'){
          temp.ShowLocus = true
          temp.marker && (temp.LocusPath = temp.marker.resLnglat ? [temp.marker.resLnglat] : [])

        }else{
          temp.ShowLocus = false
          temp.Polyline && this.map.remove(temp.Polyline)
          temp.Polyline = undefined
        }

      }
    },
    ShowLocus2Map(term){
      if(!term.LocusPath){
        term.LocusPath = []
      }
      term.LocusPath.push(term.marker.resLnglat)

      if(!term.Polyline){
        term.Polyline = new AMap.Polyline({
          path: term.LocusPath,  
          borderWeight: 2, // 线条宽度，默认为 1
          strokeColor: this.$tools.getRandomColor(), // 线条颜色
          lineJoin: 'round' // 折线拐点连接处样式
        })
        this.map.add(term.Polyline)
      }else {
        term.Polyline.setPath(term.LocusPath)
      }
    },
    GetInfoWindowContent(puname,puid,Lnglat){
      return `
        <p style="display:flex;line-height:30px;height:30px">
          <span style='font-size:15px;font-weight:600'>${this.$t(
            "Monitor.Term"
          )} </span> 
          <span style="display:inline-block;padding-left:10px">${puname}
            <span style="color:#ccc;padding-left:5px">(${puid.slice(
              3
            )})</span>
          </span>
        </p>
        <p style="display:flex;width:220px;line-height:30px;height:30px">
          <span style='font-size:15px;font-weight:600'>${this.$t(
            "Monitor.Position"
          )} </span> 
          <span style="display:inline-block;flex:1;text-align:center">${
            Lnglat[0]
          }</span>   
          <span style="display:inline-block;flex:1;text-align:center">${
            Lnglat[1]
          }</span>
        </p>
        <p style="margin-top:10px;text-align:center">
          <button class="openVideo ivu-btn ivu-btn-success" onclick="MapOpenVideo('${puid}')">${this.$t(
            "Monitor.LiveVideo"
          )}</button>
          <button class="ivu-btn ivu-btn-success" onclick="MapOpenSpeak('${puid}')">${this.$t(
            "Monitor.Intercom"
          )}</button>
        </p>
      `
    },
    SetMarkerToMap(gps,el,success_cb,error_cb) {
        return new Promise((resolve,reject)=>{

             
          let SetMarkerAndInfoWindow = (long,lat) => {
            AMap.convertFrom([long,lat], "gps", (status, result) => {
                  if (result.info === "ok") {
                    var resLnglat = result.locations[0];
                    let marker;
                    if(!el.marker){
                      marker = new AMap.Marker({
                        position: resLnglat,
                        icon: require("@/assets/images/gps.png")
                      });
                      let markerContent = document.createElement("div");
                      let markerSpan = document.createElement("span");
                      let markerImg = document.createElement("img");
                      markerImg.className = "markerlnglat";
                      // markerImg.src = "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png";
                      markerImg.src = require("@/assets/images/gps.png");
                      markerContent.appendChild(markerImg);
                      markerSpan.className = "marker";
                      markerSpan.innerHTML =
                        gps._parent._name_pu || gps._parent._id_pu;
                      markerContent.appendChild(markerSpan);
                      marker.setContent(markerContent);

                      //设备信息
                      let puid = gps._parent._id_pu;
                      let puname =
                        gps._parent._name_pu || gps._parent._id_pu;
                      this.position[2] = gps
                      var info = this.GetInfoWindowContent(puname,puid,[long, lat]);

                      let infoWindow = new AMap.InfoWindow({
                        anchor: "top-center",
                        content: info //使用默认信息窗体框样式，显示信息内容
                      });

                      marker.resLnglat = resLnglat
                      let infoWindowClose = false;
                      infoWindow.on("close", () => {
                        infoWindowClose = false;
                      });
                      marker.on("click", (e) => {
                        if (!infoWindowClose) {
                          marker.setzIndex(++this.zindex);
                          infoWindow.open(this.map,marker.resLnglat)
                          infoWindowClose = true;
                        }
                      });

                      if(el.openInfo){
                        infoWindow.open(this.map, resLnglat);
                        infoWindowClose = true;
                      }

                      el.marker = marker;
                      marker.infoWindow = infoWindow
                      
                      this.map.add(marker);

                      // 为了双击设备后居中回调
                      resolve(true)
                    }else{
                      el.marker.resLnglat = resLnglat
                      el.marker.setPosition(resLnglat)
                      let puid = gps._parent._id_pu;
                      let puname =
                      gps._parent._name_pu || gps._parent._id_pu;  
                      el.marker.infoWindow.setContent(this.GetInfoWindowContent(puname,puid,[long, lat]))
                      el.marker.infoWindow.setPosition(resLnglat)
                      resolve(true)
                    }
                    if(el.ShowLocus){
                      this.ShowLocus2Map(el)
                    }
                  }

                })
          }
          if (!el.lastGpsData) {
            el.lastGpsData = {
              state: [],
              data: []
            } 
            el.lastGpsData.state[0] = this.$store.state.ErrorCode = gps.swOpen({
              callback: (options, response) => {
                el.lastGpsData.state[1] = response.emms.code
                if (response.emms.code != 0){
                  console.log('GPS获取失败',this.$tools.findErrorCode(response.emms.code));
                  resolve(false);
                  return
                }
                const lat = response.gps.lat / 10000000;
                const long = response.gps.long / 10000000;
                el.lastGpsData.data = [long,lat];
                console.log( (gps._parent._name_pu || gps._parent._id_pu ) + ' 持续获取GPS信息中。。。',[long,lat]);
                if(!el.marker)
                  SetMarkerAndInfoWindow(long,lat)
              }
            })

            if(el.lastGpsData.state[0]) {
              resolve(false)
            }
          } else {
            if (!el.lastGpsData.state) {
              resolve(false)
            }
            if (el.lastGpsData.state[0] == 0 && el.lastGpsData.state[1] == 0) {
              let [long,lat] = el.lastGpsData.data
              SetMarkerAndInfoWindow(long,lat)
            } 
          }
          
        })
    },
    SetPuInfoLatLon2Marker(el,resLnglat){
      // this.session.swGetPuDeviceInfo({
      //     puid: el.pu_id,
      //     callback: (options,response,data) =>{
      //       this.$store.state.ErrorCode = response.emms.code
      //       if(response.emms.code!=0){
      //          this.$Message.error(this.$tools.findErrorCode(response.emms.code))
      //          return
      //       }
        console.log("Map.vue 记录最后的位置信息:" , ( el.lastGpsData && el.lastGpsData.data ));
        let info = el.pu_info || this.session.swGetPu(el.pu_id)['_info_pu']
        if (!info || !info.lat || !info.long ) {
          if(el.lastGpsData && el.lastGpsData.data) {
            let [long,lat] = el.lastGpsData.data;
            info.long = long
            info.lat = lat
          }
        }
        console.log(el.pu_id+":",info,info.lat ,info.long);
        // if (0.0 > data.iLongitude/10000000 || 180.0 < data.iLongitude/10000000)
        //   return 
        //     //纬度最大是90° 最小是0°
        // if (0.0 > data.iLatitude/10000000 || 90.0 < data.iLatitude/10000000)
        //   return 
        if(!this.$tools.LatLongValid(info.lat/10000000,info.long/10000000)){
          // this.$Message.error(this.session.swGetPu(el.pu_id)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
          return
        }
        this.SetMarker({
          position:[info.long/10000000, info.lat/10000000],
          pu_id: info.id,
          pu_name: info.name
        },el)

        console.log(this.session.swGetPuChanel(info.id, 65536))
        
        this.LocateTerms.push(el)
    },
    SetLocateAllTerm(list) {
      this.LocateTerms = []
      console.log('SetLocateAllTerm',list)
      list.forEach(el => {
        if(this.$store.state.locateCheckData[el.pu_id] && this.$store.state.locateCheckData[el.pu_id].length>0){
          if(this.$store.state.locateCheckData[el.pu_id][0].isChecked == 'add'){
            return
          }
        }
        this.SetPuInfoLatLon2Marker(el)
      })
      // this.LocateTerms.forEach(el => {
      //   let gps = this.session.swGetPuChanel(el.pu_id, 65536);
      //   if (gps == null) return
      //   this.SetMarkerToMap(gps,el)
      //   el.timer = setInterval(()=>{this.SetMarkerToMap(gps,el)},5000)
      // })
      
    },
    SetSchedulingMap() {
      
      this.map.clearMap();
      this.SchedulingList.forEach(el => {
        el.marker = undefined;
      });
      if (this.IntervalGetGpsID != undefined) {
        clearInterval(this.IntervalGetGpsID);
      }
      let func = () => {
        this.SchedulingList.forEach(el => {
          let code;
          this.$store.state.ErrorCode = code = el.swOpen({
            // interval:5000,
            // repeat:-1,
            callback: (options, response) => {
              el.swClose();
              if (response.emms.code != 0) return;
              this.$store.state.ErrorCode = response.emms.code;
              let lat = response.gps.lat / 10000000;
              let long = response.gps.long / 10000000;

              if(!this.$tools.LatLongValid(lat,long)){
                return
              }
              // this.ChannelContent = true;
              // this.position = [long, lat,this.openChannel];
              AMap.convertFrom([long, lat], "gps", (status, result) => {
                if (result.info === "ok") {
                  var resLnglat = result.locations[0];
                  let marker;
                  if (!el.marker) {
                    marker = new AMap.Marker({
                      position: resLnglat,
                      icon: require("@/assets/images/gps.png")
                    });
                    let markerContent = document.createElement("div");
                    let markerSpan = document.createElement("span");
                    let markerImg = document.createElement("img");
                    markerImg.className = "markerlnglat";
                    // markerImg.src = "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png";
                    markerImg.src = require("@/assets/images/gps.png");
                    markerContent.appendChild(markerImg);
                    markerSpan.className = "marker";
                    markerSpan.innerHTML =
                      el._parent._name_pu || el._parent._id_pu;
                    markerContent.appendChild(markerSpan);
                    marker.setContent(markerContent);

                    //设备信息
                    let puid = el._parent._id_pu;
                    let puname =
                      el._parent._name_pu || el._parent._id_pu;
                    this.position[2] = el
                    
                    var info = this.GetInfoWindowContent(puname,puid,[long, lat]);

                    let infoWindow = new AMap.InfoWindow({
                      anchor: "top-center",
                      content: info //使用默认信息窗体框样式，显示信息内容
                    });

                    let infoWindowClose = false;
                    infoWindow.on("close", () => {
                      infoWindowClose = false;
                    });
                    marker.resLnglat = resLnglat
                    marker.on("click", (e) => {
                      if (!infoWindowClose) {
                        // infoWindow.open(this.map, marker.resLnglat);
                        infoWindow.open(this.map, marker.resLnglat);
                        infoWindowClose = true;
                      }
                    });

                    el.marker = marker;
                    el.marker.infoWindow = infoWindow
                    this.map.add(marker);
                  } else {
                    el.marker.setPosition(resLnglat);
                    el.marker.infoWindow.setPosition(resLnglat)
                    el.marker.resLnglat = resLnglat
                  }
                  // this.map.setFitView();
                }
              });
            }
          });
        });
      };
      func();
      this.IntervalGetGpsID = setInterval(func, 5000);
    },
    SetUi() {
      window.initAMapUI();
      AMapUI.loadUI(["control/BasicControl"], BasicControl => {
        //添加一个缩放控件
        this.map.addControl(
          new BasicControl.Zoom({
            position: "lt"
          })
        );

        //图层切换控件
        this.map.addControl(
          new BasicControl.LayerSwitcher({
            position: "rt"
          })
        );
      });
    },
    Open(pu_id) {
      let channel = this.session.swGetPu(pu_id);
      this.tag = 0;
      this.puid = channel._id_pu;
      this.puname = channel._name_pu || channel._id_pu;
      this.tagEl = 0;

      this.VideoModal = true;
    },
    OpenSpeakDialog(pu_id) {
      this.puid = pu_id
      this.StartMode = false;
      this.SpeakModal = true;
    },
    MouseMove(e){
      // console.log(e)
      let div = document.querySelector('.SpeakDiv')
      if(e.target != div && this.StartMode){
        this.OpenSpeak()
      } 
    },
    _OpenSpeak(on_off){
      let channel = this.session.swGetPuChanel(this.puid, 0);
      if(on_off){
        var result = channel.swOpenIntercom({
          isSendAudio: true,
          isRecvAudio: true,
          callback: (options, response) => {
            console.log('打开对讲回调',response.emms.code)
            
            if (response.emms.code == jSW.RcCode.RC_CODE_S_OK) {
              this.StartMode = true;
              return;
            }
            this.StartMode = false;
            this.$Message.error(this.$tools.findErrorCode(response.emms.code));
          },
          tag: channel
        });
        if(result==0){
          this.StartMode = true;
        }
        console.log('打开对讲返回',result)
      }else{
        var rc = channel.swCloseIntercom({
          callback: function(options, response) {
            console.log('关闭对讲回调',response.emms.code)
            if (response.emms.code != 0) {
              this.$Message.error(
                this.$tools.findErrorCode(response.emms.code)
              );
            }
          }
        });
        console.log('关闭对讲返回',rc)
        this.StartMode = false;
      }
    },
    OpenSpeak() {
      
      this._OpenSpeak(!this.StartMode)
      
    },
    GetGPSValid(gps){
      
      return new Promise((resolve,reject)=>{
          gps.swOpen({
            callback: (options, response) => {
              if (response.emms.code != 0){
                console.log('GPS获取失败',this.$tools.findErrorCode(response.emms.code));
                resolve(false)
                return
              } 

              this.$store.state.ErrorCode = response.emms.code;
              
              let lat = response.gps.lat / 10000000;
              let long = response.gps.long / 10000000;
              console.log(lat,long)
              if(!this.$tools.LatLongValid(lat,long)){
                resolve(false)
              }else{
                resolve(true)
              }
            }
        })
      })

    },
    async ShowOneMarker(puid){
      let index = this.LocateTerms.findIndex(el=>el.pu_id == puid)
      if(index === -1){
        let temp = {pu_id:puid,openInfo:true}
        let gps = this.session.swGetPuChanel(temp.pu_id, 65536);
        if (!gps) {
          console.log("GPS 通道：",gps);
          this.$Message.error(this.session.swGetPu(puid)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
          return
        }
        // if(! (await this.GetGPSValid(gps)) ){
        //   this.$Message.error(this.session.swGetPu(puid)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
        //   return
        // }
        const result = await this.SetMarkerToMap(gps,temp)
        debugger
        if(!result) {
          this.$Message.error(this.session.swGetPu(puid)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
          console.log(this.$store.state.locateCheckData[puid])
          return
        }

        this.map.setFitView([temp.marker],false,undefined,this.map.getZoom())

        this.LocateTerms.push(temp)
        return
      }

      for(var i=0;i<this.LocateTerms.length;i++){
        if(this.LocateTerms[i].marker){
          if(this.LocateTerms[i].marker.infoWindow) {
            this.LocateTerms[i].marker.infoWindow.close()
          }
        }
      }

      if (this.LocateTerms[index].marker) {
        this.map.setFitView([this.LocateTerms[index].marker],false,undefined,this.map.getZoom( ))
        this.LocateTerms[index].marker.infoWindow.open(this.map,this.LocateTerms[index].marker.resLnglat)
      }
      
    },
    SetMarker(options,el) {
      if (!this.map) {
        this.SetMap();
        return;
      }
      AMap.convertFrom(options.position, "gps", (status, result) => {
        if (result.info === "ok") {
          var resLnglat = result.locations[0];
          let marker = new AMap.Marker({
            position: resLnglat,
            // offset: new AMap.Pixel(0, 0),
            icon: require("@/assets/images/gps.png")
          });

          // this.map.clearMap();

          let markerContent = document.createElement("div");
          let markerSpan = document.createElement("span");
          let markerImg = document.createElement("img");
          markerImg.className = "markerlnglat";
          // markerImg.src = "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png";
          markerImg.src = require("@/assets/images/gps.png");
          markerContent.appendChild(markerImg);
          markerSpan.className = "marker";
          markerSpan.innerHTML =
            options.pu_name || options.pu_id;
          markerContent.appendChild(markerSpan);
          marker.setContent(markerContent);

          this.map.add(marker);
          //this.map.setFitView();
          // this.map.setZoom(15);
          this.loading = false;

          //设备信息
          let puid,puname;
          if(options){
            puid = options.pu_id
            puname = options.pu_name || options.pu_id
          }else{
            let channel = this.position[2];
            puid = channel._parent._id_pu;
            puname = channel._parent._name_pu || channel._parent._id_pu;
          }
          

          var info = this.GetInfoWindowContent(puname,puid,[options.position[0],options.position[1]]);
          
          let infoWindow = new AMap.InfoWindow({
            anchor: "top-center",
            content: info //使用默认信息窗体框样式，显示信息内容
          });
          marker.resLnglat = resLnglat
          let infoWindowClose = false;
          infoWindow.on("close", () => {
            infoWindowClose = true;
          });
          marker.infoWindow = infoWindow
          if(options){
            if(options.openInfo){
              infoWindow.open(this.map, resLnglat);
            }else{
              infoWindowClose = true
            }
          }else{
            infoWindow.open(this.map, resLnglat);
          }
          marker.on("click", (e) => {
            if (infoWindowClose) {
              // infoWindow.open(this.map, e.lnglat);
              // if(marker.resLnglat){
                // infoWindow.setPosition(marker.resLnglat)
              // }else{
                infoWindow.open(this.map, resLnglat);
              // }
              marker.setzIndex(++this.zindex);
              infoWindowClose = false;
            }
          });
          el.marker = marker
        }
      });
    },
    SetMap() {
      // this.loading = true;
      // if(this.isFirst){
      //   this.map = new AMap.Map('container', {
      //     resizeEnable: true
      //   })
      //   this.isFirst = false
      //   this.loading = false
      //   return
      // }
      if (!this.map) {
        this.map = new AMap.Map("_container", {
          resizeEnable: true,
          isHotspot: false,
          zoom: 13,
          zooms: [3,22]
        });
        console.log(this.map);
        this.map.on("complete", () => {
          this.SetUi();
          this.loading = false;
          console.log('doJobs');
          
          this.complete_job.forEach(item=>{
            item()
          })
            
        });
      } 
      // else {
      //   this.SetMarker();
      // }
    },
    MP(key) {
      const p1 = new Promise(function(resolve, reject) {
        window._init = function() {
          console.log("script1-------onload");
          resolve(AMap);
        };
        if (document.querySelector("#Map")) {
          resolve(AMap);
          return;
        }
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.id = "Map";
        script.src =
          "//webapi.amap.com/maps?v=1.4.15&key=" + key + "&callback=_init";
        script.onerror = reject;
        document.head.appendChild(script);
      });
      const p2 = new Promise(function(resolve, reject) {
        if (document.querySelector("#MapUi")) {
          resolve("Suceess");
          return;
        }
        let script2 = document.createElement("script");
        script2.type = "text/javascript";
        script2.src = "//webapi.amap.com/ui/1.0/main-async.js";
        script2.id = "MapUi";
        script2.onerror = reject;
        script2.onload = function(su) {
          console.log("script2-------onload", su);
          resolve("success");
        };
        document.head.appendChild(script2);
      });
      return Promise.all([p1, p2])
        .then(function(result) {
          console.log("result----------->", result);
          return result[0];
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  mounted() {
    this.SetMap();
  },
  created() {
    console.log("created");
    this.loading = true;
    // this.MP("2d7458fc3ae350eb4b0b40bd82cc3f94").then(data => {
    //   console.log(data);
    //   this.SetMap();
    // });

    window.MapOpenVideo = this.Open;
    window.MapOpenSpeak = this.OpenSpeakDialog;
    // AMap.plugin("AMap.Geolocation", function() {
    //   var geolocation = new AMap.Geolocation({
    //     enableHighAccuracy: true, //是否使用高精度定位，默认:true
    //     timeout: 10000, //超过10秒后停止定位，默认：5s
    //     buttonPosition: "RB", //定位按钮的停靠位置
    //     buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
    //     zoomToAccuracy: true //定位成功后是否自动调整地图视野到定位点
    //   });
    //   map.addControl(geolocation);
    //   geolocation.getCurrentPosition(function(status, result) {
    //     if (status == "complete") {

    //     } else {

    //     }
    //   });
    // });
  },
  destroyed() {
    if (undefined != this.IntervalGetGpsID) {
      clearInterval(this.IntervalGetGpsID);
    }
    this.LocateTerms && this.LocateTerms.forEach(el=>{
      clearInterval(el.timer)
    })
    if(this.StartMode){
      this._OpenSpeak(false)
    }
    this.map.destroy();
  }
};
</script>

<style lang="less">
.marker_top {
  z-index: 999999;
}
#container {
  width: 100%;
  height: 100%;
  #_container {
    width: 100%;
    height: 100%;
  }
  .amap-icon img,
  .amap-marker-content img {
    width: 25px;
    height: 34px;
  }

  .marker {
    position: absolute;
    // top: -20px;
    // right: -118px;
    color: #fff;
    padding: 4px 10px;
    box-shadow: 1px 1px 1px rgba(10, 10, 10, 0.2);
    white-space: nowrap;
    font-size: 12px;
    font-family: "";
    background-color: #25a5f7;
    border-radius: 3px;
  }
  .input-card {
    width: 18rem;
    z-index: 170;
  }

  .input-card .btn {
    margin-right: 0.8rem;
  }

  .input-card .btn:last-child {
    margin-right: 0;
  }
}
</style>

