<template>
  <!-- <div id="container" v-loading="loading" @mousemove="MouseMove($event)"> -->
  <div id="container" v-loading="loading">
    <div id="_container"></div>
    <Modal footer-hide v-model="VideoModal" draggable scrollable>
      <p slot="header" style="color:#000;text-align:center">
        <span>{{ $t("Monitor.LiveVideo")}}</span>
      </p>
      <div style="text-align:center;height:500px;">
        <video-box
          v-if="VideoModal"
          :VideoTypeSetting="true"
          :tag="tag"
          :puid="puid"
          :puname="puname"
          :tagEl="tagEl"
        />
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
      <div style="text-align:center; cursor: pointer" class="SpeakDiv" @click="OpenSpeak">
        <img
          @dragstart.prevent
          @contextmenu.prevent
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
import BVMap from "@/plugins/map"
export default {
  components: { VideoBox },
  props: ["position", "SchedulingList", "target"],
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
      zindex: 1
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
    notify(val) {
      if (val.onlinestatus === 0) {
        let index = this.LocateTerms.findIndex(
          el => el.pu_id == val.content._id_pu
        );
        if (index == -1) return;

        if (this.LocateTerms[index].timer) {
          clearInterval(this.LocateTerms[index].timer);
        }
        if (this.LocateTerms[index].marker) {
          this.LocateTerms[index].marker._label &&
            BVMap.removeOverLay(this.LocateTerms[index].marker._label);
          BVMap.closeInfoWindow(this.LocateTerms[index].marker);
          BVMap.removeOverLay(this.LocateTerms[index].marker);
        }

        if (this.LocateTerms[index].Polyline) {
          this.LocateTerms[index].ShowLocus = false;
          BVMap.removeOverLay(this.LocateTerms[index].Polyline);
          this.LocateTerms[index].LocusPath = undefined;
        }

        this.LocateTerms.splice(index, 1);
      } else {
        let temp = {};
        temp["pu_id"] = val.content._id_pu;
        temp["pu_info"] = val.content._info_pu;
        let PuCheckInfo = this.$store.state.locateCheckData[val.content._id_pu];

        if (PuCheckInfo) {
          setTimeout(() => {
            this.SetPu2LocateTerms(
              val.content._id_pu,
              PuCheckInfo[0]["key"],
              PuCheckInfo[0].isChecked ? "add" : "remove"
            );
            setTimeout(() => {
              this.SetPu2LocateTerms(
                val.content._id_pu,
                PuCheckInfo[1]["key"],
                PuCheckInfo[1].isChecked ? "add" : "remove"
              );
            }, 2000);
          }, 1000);
        }
        this.SetPuInfoLatLon2Marker(temp);
      }

      if (val == undefined && !this.StartMode) return;
      if (this.puid == val.content._id_pu) {
        if (!this.$store.state.notifyTip[this.puid]) {
          this.$Message.error(this.$t("Data.shebeiyilixian"));
          this.OpenSpeak();
          this.SpeakModal = false;
          this.$store.state.notifyTip[this.puid] = true;
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
    async SetPu2LocateTerms(pu_id, tag, isChecked) {
      console.log(pu_id);
      if (!this.map) {
        this.complete_job.push(() => {
          if (isChecked == "add") {
            this.SetPu2LocateTerms(pu_id, tag, isChecked);
          }
        });
        return;
      }
      let index = this.LocateTerms.findIndex(el => el.pu_id == pu_id);
      if (tag == "weizhi") {
        if (isChecked == "add") {
          let temp = { pu_id };
          if (index != -1) {
            temp = this.LocateTerms[index];
            if (temp.marker) {
              // temp.lastGpsData = undefined
              // temp.marker.setMap(null)
              BVMap.removeOverLay(temp.marker)
              // this.map.removeOverLay(temp.marker);
              temp.marker._label && BVMap.removeOverLay(temp.marker._label);
              temp.marker.infoWindow && BVMap.closeInfoWindow(temp.marker);
              temp.marker = undefined;
            }
          }

          let gps = this.session.swGetPuChanel(temp.pu_id, 65536);
          if (gps == null) {
            this.$store.state.locateCheckData[pu_id].forEach(setting => {
              setting.isChecked = false;
            });
            return;
          }

          const result = await this.SetMarkerToMap(gps, temp);
          if (!result) {
            this.$Message.error(
              this.session.swGetPu(pu_id)["_name_pu"] +
                " " +
                this.$t("Data.weizhihuoqushibai")
            );
            console.log(this.$store.state.locateCheckData[pu_id]);
            this.$store.state.locateCheckData[pu_id].forEach(setting => {
              setting.isChecked = false;
            });
            return;
          }

          BVMap.setFitView([temp.marker],BVMap.getLngLat(temp.marker))

          // this.map.setFitView([temp.marker],false,undefined,this.map.getZoom())

          temp["timer"] = setInterval(async () => {
            await this.SetMarkerToMap(gps, temp);
          }, 5000);

          if (index == -1) {
            this.LocateTerms.push(temp);
          }
        } else {
          if (index == -1) {
            console.log(this.$store.state.locateCheckData[pu_id]);
            this.$store.state.locateCheckData[pu_id].forEach(setting => {
              setting.isChecked = false;
            });
            return;
          }
          if (this.LocateTerms[index].timer == undefined) {
            console.log(this.$store.state.locateCheckData[pu_id]);

            return;
          }
          let lastGpsData = this.LocateTerms[index].lastGpsData;
          clearInterval(this.LocateTerms[index].timer);
          if (this.LocateTerms[index].marker) {
            BVMap.closeInfoWindow(this.LocateTerms[index].marker)
            // this.LocateTerms[index].marker.closeInfoWindow();
          }
        }
      } else if (tag == "guiji") {
        if (index == -1) {
          console.log(this.$store.state.locateCheckData[pu_id]);
          this.$store.state.locateCheckData[pu_id].forEach(setting => {
            setting.isChecked = false;
          });
          return;
        }

        let temp = this.LocateTerms[index];

        if (isChecked == "add") {
          temp.ShowLocus = true;
          temp.marker &&
            (temp.LocusPath = temp.marker.resLnglat
              ? [temp.marker.resLnglat]
              : []);
        } else {
          temp.ShowLocus = false;
          temp.Polyline && BVMap.removeOverLay(temp.Polyline);
          temp.Polyline = undefined;
        }
      }
    },
    ShowLocus2Map(term) {
      if (!term.LocusPath) {
        term.LocusPath = [];
      }
      term.LocusPath.push(term.marker.resLnglat);

      if (!term.Polyline) {
        BVMap.Polyline(term,term.LocusPath, {
          weight: 5, // 线条宽度，默认为 1
          // color: this.$tools.getRandomColor(), // 线条颜色
          color: "#2b64b0" // 线条颜色
        })
        
        BVMap.addOverLay(term.Polyline);
      } else {
       BVMap.SetPolylinePath(term.Polyline, term.LocusPath);
      }
    },
    GetInfoWindowContent(puname, puid, Lnglat) {
      return `
        <p style="display:flex;line-height:30px;height:30px">
          <span style='font-size:15px;font-weight:600'>${this.$t(
            "Monitor.Term"
          )} </span> 
          <span style="display:inline-block;padding-left:10px">${puname}
            <span style="color:#ccc;padding-left:5px">(${puid.slice(3)})</span>
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
      `;
    },
    SetMarkerToMap(gps, el, success_cb, error_cb) {
      return new Promise(  (resolve, reject) => {
        let SetMarkerAndInfoWindow = async (long, lat) => {
          var resLnglat = await BVMap.LngLat(long, lat);
          let marker;
          if (!el.marker) {
            // let icon = new T.Icon({
            //   iconUrl: require("@/assets/images/gps.png"),
            //   iconSize: new T.Point(19, 27),
            //   iconAnchor: new T.Point(10, 25)
            // });
            // marker = new T.Marker(resLnglat, { icon: icon });

            // let label = new T.Label({
            //   text: gps._parent._name_pu || gps._parent._id_pu,
            //   position: marker.getLngLat(),
            //   offset: new T.Point(0, -15)
            // });
            // marker._label = label;
            // this.map.addOverLay(label);
            // this.map.addOverLay(marker);

            //设备信息
            let puid = gps._parent._id_pu;
            let puname = gps._parent._name_pu || gps._parent._id_pu;
            this.position[2] = gps;
            var info = this.GetInfoWindowContent(puname, puid, [long, lat]);

            BVMap.SetMarkerAndInfo(el, resLnglat, gps._parent._name_pu || gps._parent._id_pu,info, el.openInfo)

            // let infoWindow = new T.InfoWindow(info);

            // marker.resLnglat = resLnglat;
            // let infoWindowClose = false;
            // infoWindow.addEventListener("close", () => {
            //   infoWindowClose = false;
            // });
            // marker.addEventListener("click", e => {
            //   if (!infoWindowClose) {
            //     marker.openInfoWindow(infoWindow);
            //     infoWindowClose = true;
            //   }
            // });

            // if (el.openInfo) {
            //   marker.openInfoWindow(infoWindow);
            //   infoWindowClose = true;
            // }

            // el.marker = marker;
            // marker.infoWindow = infoWindow;

            // 为了双击设备后居中回调
            resolve(true);
          } else {


            // if (resLnglat.equals(el.marker.getLngLat())) {
            //   resolve(true);
            //   return;
            // }
            // let isopen = el.marker.infoWindow.isOpen();
            // if (isopen) {
            //   el.marker.infoWindow.closeInfoWindow();
            // }
            // el.marker.resLnglat = resLnglat;
            // el.marker._label && el.marker._label.setLngLat(resLnglat);
            let puid = gps._parent._id_pu;
            let puname = gps._parent._name_pu || gps._parent._id_pu;
            let info = this.GetInfoWindowContent(puname, puid, [long, lat])
            BVMap.ChangeLocation(el.marker, resLnglat,info)

            // el.marker.infoWindow.setContent.call(
            //   el.marker.infoWindow,
            //   this.GetInfoWindowContent(puname, puid, [long, lat])
            // );

            // console.log("setLnglat ", resLnglat);
            // el.marker.setLngLat.call(el.marker, resLnglat);

            // if (isopen) {
            //   el.marker.openInfoWindow.call(el.marker, el.marker.infoWindow);
            // }

            if (el.marker) resolve(true);
          }
          if (el.ShowLocus) {
            this.ShowLocus2Map(el);
          }

          // })
        };
        if (!el.lastGpsData) {
          el.lastGpsData = {
            state: [],
            data: []
          };
          el.lastGpsData.state[0] = this.$store.state.ErrorCode = gps.swOpen({
            tag: gps,
            callback: (options, response) => {
              el.lastGpsData.state[1] = response.emms.code;
              if (response.emms.code != 0) {
                console.log(
                  "GPS获取失败",
                  this.$tools.findErrorCode(response.emms.code)
                );
                resolve(false);
                return;
              }
              const lat = response.gps.lat / 10000000;
              const long = response.gps.long / 10000000;
              el.lastGpsData.data = [long, lat];
              console.log(
                (gps._parent._name_pu || gps._parent._id_pu) +
                  " 持续获取GPS信息中。。。",
                [long, lat]
              );
              if (!el.marker) SetMarkerAndInfoWindow(long, lat);
            }
          });

          if (el.lastGpsData.state[0]) {
            resolve(false);
          }
        } else {
          if (!el.lastGpsData.state) {
            resolve(false);
          }
          if (el.lastGpsData.state[0] == 0 && el.lastGpsData.state[1] == 0) {
            let [long, lat] = el.lastGpsData.data;
            SetMarkerAndInfoWindow(long, lat);
          }
        }
      });
    },
    SetPuInfoLatLon2Marker(el, resLnglat) {
      // this.session.swGetPuDeviceInfo({
      //     puid: el.pu_id,
      //     callback: (options,response,data) =>{
      //       this.$store.state.ErrorCode = response.emms.code
      //       if(response.emms.code!=0){
      //          this.$Message.error(this.$tools.findErrorCode(response.emms.code))
      //          return
      //       }
      console.log(
        "Map.vue 记录最后的位置信息:",
        el.lastGpsData && el.lastGpsData.data
      );
      let info = el.pu_info || this.session.swGetPu(el.pu_id)["_info_pu"];
      if (!info || !info.lat || !info.long) {
        if (el.lastGpsData && el.lastGpsData.data) {
          let [long, lat] = el.lastGpsData.data;
          info.long = long;
          info.lat = lat;
        }
      }
      console.log(el.pu_id + ":", info, info.lat, info.long);
      // if (0.0 > data.iLongitude/10000000 || 180.0 < data.iLongitude/10000000)
      //   return
      //     //纬度最大是90° 最小是0°
      // if (0.0 > data.iLatitude/10000000 || 90.0 < data.iLatitude/10000000)
      //   return
      if (
        !this.$tools.LatLongValid(info.lat / 10000000, info.long / 10000000)
      ) {
        // this.$Message.error(this.session.swGetPu(el.pu_id)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
        return;
      }
      this.SetMarker(
        {
          position: [info.long / 10000000, info.lat / 10000000],
          pu_id: info.id,
          pu_name: info.name
        },
        el
      );

      console.log(this.session.swGetPuChanel(info.id, 65536));

      this.LocateTerms.push(el);
    },
    SetLocateAllTerm(list) {
      this.LocateTerms = [];
      console.log("SetLocateAllTerm", list);
      list.forEach(el => {
        if (
          this.$store.state.locateCheckData[el.pu_id] &&
          this.$store.state.locateCheckData[el.pu_id].length > 0
        ) {
          if (
            this.$store.state.locateCheckData[el.pu_id][0].isChecked == "add"
          ) {
            return;
          }
        }
        this.SetPuInfoLatLon2Marker(el);
      });
      // this.LocateTerms.forEach(el => {
      //   let gps = this.session.swGetPuChanel(el.pu_id, 65536);
      //   if (gps == null) return
      //   this.SetMarkerToMap(gps,el)
      //   el.timer = setInterval(()=>{this.SetMarkerToMap(gps,el)},5000)
      // })
    },
    SetSchedulingMap() {
      BVMap.clearOverLays();
      this.SchedulingList.forEach(el => {
        el.marker = undefined;
      });
      debugger;
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

              if (!this.$tools.LatLongValid(lat, long)) {
                return;
              }
              // this.ChannelContent = true;
              // this.position = [long, lat,this.openChannel];

              var resLnglat = new BVMap.LngLat(long, lat);
              let marker;
              if (!el.marker) {
                
                
                //设备信息
                let puid = gps._parent._id_pu;
                let puname = el._parent._name_pu || el._parent._id_pu;
                this.position[2] = gps;
                var info = this.GetInfoWindowContent(puname, puid, [long, lat]);

                BVMap.SetMarkerAndInfo(el, resLnglat, el._parent._name_pu || el._parent._id_pu ,false)

                this.position[2] = el;
               
              } else {
                
                
                let puid = el._parent._id_pu;
                let puname = el._parent._name_pu || el._parent._id_pu;
                let info = this.GetInfoWindowContent(puname, puid, [long, lat])

                BVMap.ChangeLocation(el.marker, resLnglat,info)

              }
              // this.map.setFitView();
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
      this.puid = pu_id;
      this.StartMode = false;
      this.SpeakModal = true;
    },
    MouseMove(e) {
      // console.log(e)
      let div = document.querySelector(".SpeakDiv");
      if (e.target != div && this.StartMode) {
        this.OpenSpeak();
      }
    },
    FindEnableChannel() {
      let puInfo = this.session.swGetPu(this.puid)
      let arrChannel = puInfo._arr_channel

      for(let index in arrChannel) {
        let channel = arrChannel[index]

        if( (channel._info_chanel.media & 12) == 12) {
          return index
        }
      }
      return -1
    },
    _OpenSpeak(on_off) {
      let channelNo = this.FindEnableChannel()
      if (channelNo === -1) {
        this.$Message.error(this.$t('Data.wuyinpinfasonghuojieshoutongdao'))
      }
      let channel = this.session.swGetPuChanel(this.puid, channelNo);

      if (on_off) {
        var result = channel.swOpenIntercom({
          isSendAudio: true,
          isRecvAudio: true,
          callback: (options, response) => {
            console.log("打开对讲回调", response.emms.code);

            if (response.emms.code == jSW.RcCode.RC_CODE_S_OK) {
              this.StartMode = true;
              return;
            }
            this.StartMode = false;
            this.$Message.error(this.$tools.findErrorCode(response.emms.code));
          },
          tag: channel
        });
        if (result == 0) {
          this.StartMode = true;
        }
        console.log("打开对讲返回", result);
      } else {
        var rc = channel.swCloseIntercom({
          callback: function(options, response) {
            console.log("关闭对讲回调", response.emms.code);
            if (response.emms.code != 0) {
              this.$Message.error(
                this.$tools.findErrorCode(response.emms.code)
              );
            }
          }
        });
        console.log("关闭对讲返回", rc);
        this.StartMode = false;
      }
    },
    OpenSpeak() {
      this._OpenSpeak(!this.StartMode);
    },
    GetGPSValid(gps) {
      return new Promise((resolve, reject) => {
        gps.swOpen({
          callback: (options, response) => {
            if (response.emms.code != 0) {
              console.log(
                "GPS获取失败",
                this.$tools.findErrorCode(response.emms.code)
              );
              resolve(false);
              return;
            }

            this.$store.state.ErrorCode = response.emms.code;

            let lat = response.gps.lat / 10000000;
            let long = response.gps.long / 10000000;
            console.log(lat, long);
            if (!this.$tools.LatLongValid(lat, long)) {
              resolve(false);
            } else {
              resolve(true);
            }
          }
        });
      });
    },
    async ShowOneMarker(puid) {
      let index = this.LocateTerms.findIndex(el => el.pu_id == puid);
      
      if (index === -1) {
        
        let temp = { pu_id: puid, openInfo: true };
        let gps = this.session.swGetPuChanel(temp.pu_id, 65536);
        if (!gps) {
          console.log("GPS 通道：", gps);
          this.$Message.error(
            this.session.swGetPu(puid)["_name_pu"] +
              " " +
              this.$t("Data.weizhihuoqushibai")
          );
          return;
        }
        // if(! (await this.GetGPSValid(gps)) ){
        //   this.$Message.error(this.session.swGetPu(puid)['_name_pu'] +' '+ this.$t('Data.weizhihuoqushibai'))
        //   return
        // }
        const result = await this.SetMarkerToMap(gps, temp);

        if (!result) {
          this.$Message.error(
            this.session.swGetPu(puid)["_name_pu"] +
              " " +
              this.$t("Data.weizhihuoqushibai")
          );
          console.log(this.$store.state.locateCheckData[puid]);
          return;
        }
        BVMap.setFitView([temp.marker],BVMap.getLngLat(temp.marker))

        this.LocateTerms.push(temp);
        return;
      }

      for (var i = 0; i < this.LocateTerms.length; i++) {
        if (this.LocateTerms[i].marker) {
          if (this.LocateTerms[i].marker.infoWindow) {
            BVMap.closeInfoWindow(this.LocateTerms[i].marker);
            // this.LocateTerms[i].marker.infoWindow.close()
          }
        }
      }

      if (this.LocateTerms[index].marker) {
        BVMap.setFitView([this.LocateTerms[index].marker],BVMap.getLngLat(this.LocateTerms[index].marker))
        BVMap.openInfoWindow(this.LocateTerms[index].marker)
        // this.LocateTerms[index].marker.openInfoWindow(
        //   this.LocateTerms[index].marker.infoWindow
        // );
      } else {
          let el = this.LocateTerms[index]
         this.SetMarker(
          {
            position: [el.pu_info.long / 10000000, el.pu_info.lat / 10000000],
            pu_id: el.pu_info.id,
            pu_name: el.pu_info.name,
            openInfo: true
          },
          el
        );
      }
    },
    async SetMarker(options, el) {
      if (!this.map) {
        this.SetMap();
        return;
      }
      
      // AMap.convertFrom(options.position, "gps", (status, result) => {
      //   if (result.info === "ok") {
      var resLnglat = await BVMap.LngLat(options.position[0], options.position[1]);
      

      // let marker = new T.Marker(resLnglat);
      // let icon = new T.Icon({
      //   iconUrl: require("@/assets/images/gps.png"),
      //   iconSize: new T.Point(19, 27),
      //   iconAnchor: new T.Point(10, 25)
      // });
      // marker = new T.Marker(resLnglat, { icon: icon });

      // let label = new T.Label({
      //   text: options.pu_name || options.pu_id,
      //   position: marker.getLngLat(),
      //   offset: new T.Point(0, -15)
      // });
      // marker._label = label;
      // this.map.addOverLay(label);
      // this.map.addOverLay(marker);

      //设备信息
      let puid, puname;
      if (options) {
        puid = options.pu_id;
        puname = options.pu_name || options.pu_id;
      } else {
        let channel = this.position[2];
        puid = channel._parent._id_pu;
        puname = channel._parent._name_pu || channel._parent._id_pu;
      }

      var info = this.GetInfoWindowContent(puname, puid, [
        options.position[0],
        options.position[1]
      ]);

      
      // let infoWindow = new T.InfoWindow(info);
      // marker.resLnglat = resLnglat;
      // let infoWindowClose = false;
      // infoWindow.addEventListener("close", () => {
      //   infoWindowClose = true;
      // });
      // marker.infoWindow = infoWindow;
      // if (options) {
      //   if (options.openInfo) {
      //     marker.openInfoWindow(infoWindow);
      //   } else {
      //     infoWindowClose = true;
      //   }
      // } else {
      //   marker.openInfoWindow(infoWindow);
      // }
      BVMap.SetMarkerAndInfo(el, resLnglat, options.pu_name || options.pu_id,info,options && options.openInfo)
      // marker.addEventListener("click", e => {
      //   if (infoWindowClose) {
      //     marker.openInfoWindow(infoWindow);
      //     infoWindowClose = false;
      //   }
      // });

      // el.marker = marker;
      //   }
      // });
    },
    async SetMap() {
      if (!this.map) {
        this.map = await BVMap.Init("_container", {
          projection: "EPSG:4326"
        });
        this.loading = false;
        console.log(this.map);
        console.log("doJobs");

        this.complete_job.forEach(item => {
          item();
        });
      }
    }
  },
  mounted() {
    window.BVMap = BVMap
    console.log("BVMap ",BVMap)
    this.SetMap();
  },
  created() {
    console.log("created");
    this.loading = true;
    window.MapOpenVideo = this.Open;
    window.MapOpenSpeak = this.OpenSpeakDialog;
  },
  destroyed() {
    if (undefined != this.IntervalGetGpsID) {
      clearInterval(this.IntervalGetGpsID);
    }
    this.LocateTerms &&
      this.LocateTerms.forEach(el => {
        clearInterval(el.timer);
      });
    if (this.StartMode) {
      this._OpenSpeak(false);
    }
    this.map.destroy && this.map.destroy();
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

