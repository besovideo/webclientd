<template>
  <div id="container" v-loading="loading">
    <div id="_container"></div>
    <Modal footer-hide v-model="VideoModal" draggable scrollable>
      <p slot="header" style="color:#000;text-align:center">
        <span>{{ $t("Monitor.LiveVideo")}}</span>
      </p>
      <div style="text-align:center;height:500px;">
        <video-box v-if="VideoModal" :tag="tag" :puid="puid" :tagEl="tagEl"/>
      </div>
      <!-- <div slot="footer">
        <Button type="error" size="large" long >Delete</Button>
      </div> -->
    </Modal>
  </div>
</template>

<script>
import VideoBox from "../../components/Monitor/VideoBox.vue";
export default {
  components:{VideoBox},
  props: ["position"],
  data() {
    return {
      loading: false,
      map: undefined,
      isFirst: true,
      VideoModal: false,
      tag:undefined,
      tagEl:undefined,
      puid:undefined
    };
  },
  watch: {
    position(val) {
      this.VideoModal = false;
      this.SetMap();
    }
  },
  methods: {
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
    Open(){
      let channel = this.position[2]
      this.tag = channel._id_chanel;
      this.puid = channel._parent._id_pu;
      this.tagEl = 0;
      this.VideoModal = true;
    },
    SetMarker() {
      if (!this.map) {
        this.SetMap();
        return;
      }
      AMap.convertFrom(this.position, "gps", (status, result) => {
        if (result.info === "ok") {
          var resLnglat = result.locations[0];
          let m2 = new AMap.Marker({
            position: resLnglat
            // icon: require('@/assets/images/video2.png')
          });

          this.map.clearMap();
          this.map.add(m2);
          this.map.setFitView();
          // this.map.setZoom(15);
          this.loading = false;

          var info = `
              <p style="display:flex;width:220px;line-height:20px;height:20px">
                <span style='font-size:16px;font-weight:600'>${this.$t("Monitor.Position")} :</span> 
                <span style="display:inline-block;flex:1;text-align:center">${
                  this.position[0]
                }</span>   
                <span style="display:inline-block;flex:1;text-align:center">${
                  this.position[1]
                }</span>
              </p>
              <p style="margin-top:10px;text-align:center">
                <button class="openVideo ivu-btn ivu-btn-success" onclick="MapOpenVideo()">${this.$t("Monitor.LiveVideo")}</button>
                <button class="ivu-btn ivu-btn-success">${this.$t("Monitor.LivePhoto")}</button>
              </p>
                    `;
          let infoWindow = new AMap.InfoWindow({
            anchor: "top-center",
            content: info //使用默认信息窗体框样式，显示信息内容
          });
          
          // infoWindow.on('open',()=>{})
          // infoWindow.on('close',showInfoClose)
          infoWindow.open(this.map, resLnglat);

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
  created() {
    console.log("created");
    this.loading = true;
    // if (!document.querySelector("#Mmap")) {
    //   var url =
    //     "https://webapi.amap.com/maps?v=1.4.15&key=2d7458fc3ae350eb4b0b40bd82cc3f94";
    //   var jsapi = document.createElement("script");
    //   jsapi.id = "Mmap";
    //   jsapi.charset = "utf-8";
    //   jsapi.src = url;
    //   document.head.appendChild(jsapi);
    //   jsapi.onload = () => {
    //     this.SetMap();
    //   };
    // } else {
    //   this.SetMap();
    // }
    this.MP("2d7458fc3ae350eb4b0b40bd82cc3f94").then(data => {
      console.log(data);
      this.SetMap();
    });
    window.MapOpenVideo = this.Open
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
}
</style>

