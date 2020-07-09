export default class BVMap implements BvMap {
  public map:any
  
  constructor(){
    
  }
  LoadScript(key: string="b8c1489d4fa591bb6e3c322be75f66cf"): Promise<any> {
    return new Promise(function(resolve, reject) {
      if (document.querySelector("#Map")) {
        resolve(T);
        return;
      }
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.id = "Map";
      script.src =
        "//api.tianditu.gov.cn/api?v=4.0&tk=" + key;
      script.onload = () => {
        console.log("天地图-------onload",T);
        resolve(T);
      }
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  Init(ele: string,opts: any): Promise<object> {
    return new Promise((resolve,reject)=>{
      this.LoadScript().then(T=>{
        this.map = new T.Map(ele,{
          projection: opts.projection || "EPSG:4326"
        })
        this.map.centerAndZoom(new T.LngLat(117.198142, 31.851985), 6);
        resolve(this.map)
      })
    })
  }
  async LngLat(lng: number, lat: number): Promise<object> {
    return new T.LngLat(lng,lat)
  }
  ChangeLocation(marker: any, resLnglat: any, info: string): void {
    if (resLnglat.equals(marker.getLngLat())) {
      return;
    }
    let isopen = marker.infoWindow.isOpen();
    if (isopen) {
      marker.infoWindow.closeInfoWindow();
    }
    marker.resLnglat = resLnglat;
    marker._label && marker._label.setLngLat(resLnglat);
  
    marker.infoWindow.setContent.call(
      marker.infoWindow,
      info
    );
  
    console.log("setLnglat ", resLnglat);
    marker.setLngLat.call(marker, resLnglat);
  
    if (isopen) {
      marker.openInfoWindow.call(marker, marker.infoWindow);
    }
  }
  SetMarkerAndInfo(Obj: any, resLnglat: object, label_name: string, info: string, openInfoWindow: boolean): void {
    let icon = new T.Icon({
      iconUrl: require("@/assets/images/gps.png"),
      iconSize: new T.Point(19, 27),
      iconAnchor: new T.Point(10, 25)
    });
    let marker = new T.Marker(resLnglat, { icon: icon });
    marker.resLnglat = resLnglat;
  
    let label = new T.Label({
      text: label_name,
      position: marker.getLngLat(),
      offset: new T.Point(0, -15)
    });
  
    marker._label = label;
    this.map.addOverLay(label);
    this.map.addOverLay(marker);
  
    let infoWindow = new T.InfoWindow(info);
    marker.resLnglat = resLnglat;
    let infoWindowClose = false;
    infoWindow.addEventListener("close", () => {
      infoWindowClose = true;
    });
    marker.infoWindow = infoWindow;
  
    if (openInfoWindow) {
      marker.openInfoWindow(infoWindow)
    } else {
      infoWindowClose = true
    }
  
    marker.addEventListener("click", e => {
      if (infoWindowClose) {
        marker.openInfoWindow(infoWindow);
        infoWindowClose = false;
      }
    });
    Obj.marker = marker
  }
  openInfoWindow(marker: any): void {
    marker.openInfoWindow(marker.infoWindow)
  }
  closeInfoWindow(marker: any): void {
    marker.closeInfoWindow()
  }
  getLngLat(marker: any): object {
    return marker.getLngLat()
  }
  setFitView(marker: any,LngLat: any): void {
    this.map.panTo(LngLat);

  }
  removeOverLay(marker: any): void {
    this.map.removeOverLay(marker);

  }
  addOverLay(any: any): void {
    this.map.addOverLay(any);

  }
  Polyline(obj: any, path: object[], opts: any): void {
    obj.Polyline = new T.Polyline(path, {
      ...opts
     });
  }
  SetPolylinePath(Polyline: any, paths: object[]): void {
    Polyline.setLngLats(paths)
  }
  destroy(): void {
    this.map.destroy && this.map.destroy()
  }
  clearOverLays(): void {
    this.map.clearOverLays && this.map.clearOverLays()
  }
  
}