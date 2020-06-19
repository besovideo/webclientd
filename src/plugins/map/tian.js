


export class BVMap {
  static Map
  static Init(Map) {
    this.Map = Map
  }

  constructor(id,opts) {
    this.map = new BVMap.Map.Map(id)
    this.map.centerAndZoom(new BVMap.Map.LngLat(116.40769, 39.89945),opts.zoom);
  }

  getMap() {
    return this.map
  }

  static convertFrom(longlat,tag,callback) {
      callback({info:'ok'}, {locations:[[...longlat]]}) 
  }

  static Marker(opts) {
    return new this.Map.Marker(opts);
  }

  static InfoWindow(opts) {
    return new BVMap.Map.InfoWindow(opts)
  }
  static Polyline(opts) {
    return new BVMap.Map.Polyline(opts)
  }

  add(cover) {
    this.map.add(cover)
  }

  remove(cover) {
    this.map.remove(cover)
  }

  on(event,func) {
    this.map.on(event,func)
  }

  destroy() {
    this.map.destroy()
  }

  getZoom() {
    return this.map.getZoom()
  }

  clearMap() {
    this.map.clearMap()
  }


  addControl(control) {
    this.map.addControl(control)
  }


  setFitView(...args) {
    this.map.setFitView(...args)
  }

}

export function loadScript(key="b8c1489d4fa591bb6e3c322be75f66cf") {
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