


export class BVMap {
  static Map
  static Init(Map) {
    this.Map = Map
  }

  constructor(opts) {
    this.map = new BVMap.Map.Map(opts)
  }

  getMap() {
    return this.map
  }

  static convertFrom(longlat,tag,callback) {
    BVMap.Map.convertFrom(longlat,tag,(status, result)=>{
      callback(status, result) 
    })
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

export function loadScript(key) {
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
    
}