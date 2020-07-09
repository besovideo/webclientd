

export default class BVMap implements BvMap {
  
  public map:any
  public zindex = 10
  constructor() {

  }

  LoadScript(key: string="2d7458fc3ae350eb4b0b40bd82cc3f94"): Promise<any> {
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
      .then((result) :any => {
        console.log("result----------->", result);
        return result[0];
      })
  }

  Init(ele: string,opts: any): Promise<object> {
    return new Promise(async (resolve,reject)=>{
      let AMap:any = await this.LoadScript()
  
      this.map = new AMap.Map(ele,{
        resizeEnable: true,
        isHotspot: false,
        zoom: 13,
        zooms: [3, 22]
      })
    
      this.map.on("complete", () => {
        resolve(this.map)
      })
    
    })
  }
  LngLat(lng: number, lat: number): Promise<object> {
    return new Promise((resolve,reject) =>{
      AMap.convertFrom([lng,lat], "gps", (status:any, result:any) => {
        if(result.info == 'ok') {
          resolve(result.locations[0])
        } else {
          new Error("转换经纬度失败")
          reject()
        }
      })
    })
  }
  ChangeLocation(marker: any, resLnglat: any, info: string): void {
    marker.resLnglat = resLnglat;

    marker.infoWindow.setContent.call(
      marker.infoWindow,
      info
    );
    marker.infoWindow.setPosition(resLnglat)
    console.log("setLnglat ", resLnglat);
    marker.setPosition.call(marker, resLnglat);
  }
  SetMarkerAndInfo(Obj: any, resLnglat: object, label_name: string, info: string, openInfoWindow: boolean): void {
    let marker = new AMap.Marker({
      position: resLnglat,
      icon: require("@/assets/images/gps.png")
    });
    marker.resLnglat = resLnglat;
  
    let markerContent = document.createElement("div");
    let markerSpan = document.createElement("span");
    let markerImg = document.createElement("img");
    markerImg.className = "markerlnglat";
    // markerImg.src = "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png";
    markerImg.src = require("@/assets/images/gps.png");
    markerContent.appendChild(markerImg);
    markerSpan.className = "marker";
    markerSpan.innerHTML =
    label_name;
    markerContent.appendChild(markerSpan);
    marker.setContent(markerContent);
  
    this.map.add(marker);
  
    let infoWindow = new AMap.InfoWindow({
      anchor: "top-center",
      content: info //使用默认信息窗体框样式，显示信息内容
    });
    marker.resLnglat = resLnglat;
    let infoWindowClose = false;
    infoWindow.on("close", () => {
      infoWindowClose = true;
    });
    marker.infoWindow = infoWindow;
  
    if (openInfoWindow) {
      marker.infoWindow.open(this.map, marker.getPosition())
    } else {
      infoWindowClose = true
    }
  
    marker.on("click", (e:any) => {
      if (infoWindowClose) {
        marker.setzIndex(++this.zindex);
        marker.infoWindow.open(this.map, marker.getPosition());
        infoWindowClose = false;
      }
    });
    Obj.marker = marker
  }
  openInfoWindow(marker: any): void {
    marker.infoWindow.open(this.map,marker.getPosition())
  }
  closeInfoWindow(marker: any): void {
    marker.infoWindow.close()
  }
  getLngLat(marker: any): object {
    return marker.getPosition()
  }
  setFitView(marker: object,LngLat: any): void {
    this.map.setFitView(marker, false, undefined,this.map.getZoom());
  }
  removeOverLay(marker: any): void {
    marker.setMap && marker.setMap(null)
    this.map.remove([marker]);
  }
  addOverLay(any: object): void {
    this.map.add([any]);
  }
  Polyline(obj: any, path: object[], opts: any): void {
    obj.Polyline = new AMap.Polyline({
      path,
      borderWeight: 2, // 线条宽度，默认为 1
      lineJoin: 'round', // 折线拐点连接处样式  
      ...opts
    });
  }
  SetPolylinePath(Polyline: any, paths: object[]): void {
    Polyline.setPath(paths)
  }
  destroy(): void {
    this.map.destroy && this.map.destroy()
  }
  clearOverLays(): void {
    this.map.clearMap && this.map.clearMap()
  }
  
}