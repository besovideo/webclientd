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
      LocateTerms: undefined
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
        let PuCheckInfo = this.$store.state.locateCheckData[val.content._id_pu]
        
        if(PuCheckInfo){
          setTimeout(() => {
            this.SetPu2LocateTerms(val.content._id_pu,PuCheckInfo[0]['key'],"add",PuCheckInfo[0].isChecked?'add':'remove')      
            this.SetPu2LocateTerms(val.content._id_pu,PuCheckInfo[1]['key'],PuCheckInfo[1].isChecked?'add':'remove')        
          }, 5000);
          
        }
        this.SetPuInfoLatLon2Marker(temp)
        
        // let gps = this.session.swGetPuChanel(temp['pu_id'], 65536);
        // if (gps == null) return
        // this.SetMarkerToMap(gps,temp)
        // temp['timer'] = setInterval(()=>{this.SetMarkerToMap(gps,temp)},5000)
        // this.LocateTerms.push(temp)
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
        // this.Close()
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
    SetPu2LocateTerms(pu_id,tag,isChecked){
      let index = this.LocateTerms.findIndex(el=>el.pu_id == pu_id)
      if(tag == 'weizhi'){

        if(isChecked=='add'){
          let temp = {pu_id};
          if(index!=-1){
            if(this.LocateTerms[index].timer!=undefined){
              return
            }
            temp = this.LocateTerms[index]
          }
          let gps = this.session.swGetPuChanel(temp.pu_id, 65536);
          if (gps == null) return
          this.SetMarkerToMap(gps,temp)
          temp['timer'] = setInterval(()=>{this.SetMarkerToMap(gps,temp)},5000)
          if(index==-1){
            this.LocateTerms.push(temp)
          }

        }else{
          
          if(index==-1)return
          if(this.LocateTerms[index].timer==undefined){
            return
          }
          this.SetPuInfoLatLon2Marker({pu_id})
          clearInterval(this.LocateTerms[index].timer)
          if(this.LocateTerms[index].marker){
            this.LocateTerms[index].marker.infoWindow.close()
            this.map.remove(this.LocateTerms[index].marker) 
          }
          this.LocateTerms.splice(index,1)
        }
      }else if(tag == 'guiji') {
        let temp = this.LocateTerms[index]

        if(isChecked=='add'){
          temp.ShowLocus = true
          temp.LocusPath = temp.marker.resLnglat ? [temp.marker.resLnglat] : []
        }else{
          temp.ShowLocus = false
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
          strokeColor: 'red', // 线条颜色
          lineJoin: 'round' // 折线拐点连接处样式
        })
        this.map.add(term.Polyline)
      }else {
        term.Polyline.setPath(term.LocusPath)
      }
    },
    SetMarkerToMap(gps,el) {
      
          let code;
          this.$store.state.ErrorCode = code = gps.swOpen({
            callback: (options, response) => {
              if (response.emms.code != 0){
                console.log('GPS获取失败',this.$tools.findErrorCode(response.emms.code));
                return
              } 
              this.$store.state.ErrorCode = response.emms.code;
              let lat = response.gps.lat / 10000000;
              let long = response.gps.long / 10000000;
              // this.ChannelContent = true;
              // this.position = [long, lat,this.openChannel];
              AMap.convertFrom([long, lat], "gps", (status, result) => {
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
                    var info = `
                      <p style="display:flex;width:220px;line-height:30px;height:30px">
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
                          long
                        }</span>   
                        <span style="display:inline-block;flex:1;text-align:center">${
                          lat
                        }</span>
                      </p>
                      <p style="margin-top:10px;text-align:center">
                        <button class="openVideo ivu-btn ivu-btn-success" onclick="MapOpenVideo()">${this.$t(
                          "Monitor.LiveVideo"
                        )}</button>
                        <button class="ivu-btn ivu-btn-success" onclick="MapOpenSpeak()">${this.$t(
                          "Monitor.Intercom"
                        )}</button>
                      </p>
                            `;

                    let infoWindow = new AMap.InfoWindow({
                      anchor: "top-center",
                      content: info //使用默认信息窗体框样式，显示信息内容
                    });

                    marker.resLnglat = resLnglat
                    let infoWindowClose = false;
                    infoWindow.on("close", () => {
                      infoWindowClose = false;
                    });
                    marker.on("click", () => {
                      if (!infoWindowClose) {
                        infoWindow.open(this.map, marker.resLnglat);
                        infoWindowClose = true;
                      }
                    });
                    el.marker = marker;
                    marker.infoWindow = infoWindow
                    this.map.add(marker);
                  }else{
                    el.marker.resLnglat = resLnglat
                    el.marker.setPosition(resLnglat)
                  }

                  if(el.ShowLocus){
                    this.ShowLocus2Map(el)
                  }

                }

              })
            }
          }) 
        
    },
    SetPuInfoLatLon2Marker(el){
      this.session.swGetPuDeviceInfo({
          puid: el.pu_id,
          callback: (options,response,data) =>{
            this.$store.state.ErrorCode = response.emms.code
            if(response.emms.code!=0){
               this.$Message.error(this.$tools.findErrorCode(response.emms.code))
               return
            }
            console.log(el.pu_id+":",data);
            if(data.iLatitude && data.iLongitude){
              this.SetMarker({
                position:[data.iLongitude/10000000, data.iLatitude/10000000],
                pu_id: data.szID,
                pu_name: data.szName
              },el)
              this.LocateTerms.push(el)
            }
          }
        })
    },
    SetLocateAllTerm(list) {
      this.LocateTerms = []
      console.log('SetLocateAllTerm',list)
      list.forEach(el => {
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
              if (response.emms.code != 0) return;
              this.$store.state.ErrorCode = response.emms.code;
              let lat = response.gps.lat / 10000000;
              let long = response.gps.long / 10000000;
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
                    var info = `
                      <p style="display:flex;width:220px;line-height:30px;height:30px">
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
                          long
                        }</span>   
                        <span style="display:inline-block;flex:1;text-align:center">${
                          lat
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
                      `;

                    let infoWindow = new AMap.InfoWindow({
                      anchor: "top-center",
                      content: info //使用默认信息窗体框样式，显示信息内容
                    });

                    let infoWindowClose = false;
                    infoWindow.on("close", () => {
                      infoWindowClose = false;
                    });
                    marker.resLnglat = resLnglat
                    marker.on("click", () => {
                      if (!infoWindowClose) {
                        infoWindow.open(this.map, marker.resLnglat);
                        infoWindowClose = true;
                      }
                    });

                    el.marker = marker;

                    this.map.add(marker);
                  } else {
                    el.marker.setPosition(resLnglat);
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
            if (response.emms.code == jSW.RcCode.RC_CODE_S_OK) {
              this.StartMode = true;
              return;
            }
            this.$Message.error(this.$tools.findErrorCode(response.emms.code));
          },
          tag: channel
        });
      }else{
        var rc = channel.swCloseIntercom({
          callback: function(options, response) {
            if (response.emms.code != 0) {
              this.$Message.error(
                this.$tools.findErrorCode(response.emms.code)
              );
            }
          }
        });
        this.StartMode = false;
      }
    },
    OpenSpeak() {
      
      this._OpenSpeak(!this.StartMode)
      
    },
    ShowOneMarker(puid){
      let index = this.LocateTerms.findIndex(el=>el.pu_id == puid)
      if(index==-1)return
      for(var i=0;i<this.LocateTerms.length;i++){
        this.LocateTerms[i].marker.infoWindow.close()
      }

      this.map.setFitView([this.LocateTerms[index].marker],false,undefined,this.map.getZoom( ))
      this.LocateTerms[index].marker.infoWindow.open(this.map,this.LocateTerms[index].marker.resLnglat)
      
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
          
          var info = `
              <p style="display:flex;width:220px;line-height:30px;height:30px">
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
                  options.position[0]
                }</span>   
                <span style="display:inline-block;flex:1;text-align:center">${
                  options.position[1]
                }</span>
              </p>
              <p style="margin-top:10px;text-align:center">
                <button class="openVideo ivu-btn ivu-btn-success" onclick="MapOpenVideo('${options.pu_id}')">${this.$t(
                  "Monitor.LiveVideo"
                )}</button>
                <button class="ivu-btn ivu-btn-success" onclick="MapOpenSpeak('${options.pu_id}')">${this.$t(
                  "Monitor.Intercom"
                )}</button>
              </p>
                    `;
          
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
          marker.on("click", () => {
            if (infoWindowClose) {
              infoWindow.open(this.map, resLnglat);
              infoWindowClose = false;
            }
          });
          el.marker = marker
        }
      });
    },
    SetMap() {
      this.loading = true;
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
          resizeEnable: true
          // zoom: 15
        });
        console.log(this.map);
        this.map.on("complete", () => {
          this.SetUi();
          this.loading = false;
        });
      } else {
        this.SetMarker();
      }
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

