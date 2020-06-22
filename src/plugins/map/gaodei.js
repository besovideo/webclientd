

function loadScript(key = "2d7458fc3ae350eb4b0b40bd82cc3f94") {
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



export function Map() {
  let map = undefined
  let zindex = 10
}
Map.prototype.Init =  function(ele){
  return new Promise(async (resolve,reject)=>{
    let AMap = await loadScript()

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



Map.prototype.LngLat = async function LngLat(lng,lat) {
  return new Promise((resolve,reject) =>{
    AMap.convertFrom([lng,lat], "gps", (status, result) => {
      if(result.info == 'ok') {
        resolve(result.locations[0])
      } else {
        new Error("转换经纬度失败")
        reject()
      }
    })
  })
}

Map.prototype.ChangeLocation = async function (marker,resLnglat,info) {

  marker.resLnglat = resLnglat;

  marker.infoWindow.setContent.call(
    marker.infoWindow,
    info
  );
  marker.infoWindow.setPosition(resLnglat)
  console.log("setLnglat ", resLnglat);
  marker.setPosition.call(marker, resLnglat);

}


Map.prototype.SetMarkerAndInfo = function(Obj, resLnglat, label_name,info, openInfoWindow = true) {
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

  marker.on("click", e => {
    if (infoWindowClose) {
      marker.setzIndex(++this.zindex);
      marker.infoWindow.open(this.map, marker.getPosition());
      infoWindowClose = false;
    }
  });
  Obj.marker = marker

}

Map.prototype.openInfoWindow =  function(marker) {
  marker.infoWindow.open(this.map,marker.getPosition())
}

Map.prototype.closeInfoWindow =  function(marker) {
  marker.infoWindow.close()
}

Map.prototype.getLngLat = function(marker) {
  return marker.getPosition()
}

Map.prototype.setFitView = function(arrmarker, LngLat) {
  this.map.setFitView(arrmarker, false, undefined,this.map.getZoom());
}
// Map.prototype.



Map.prototype.removeOverLay = function(marker) {
  marker.setMap && marker.setMap(null)
  this.map.remove([marker]);
}

Map.prototype.addOverLay = function(any) {
  this.map.add([any]);
}


Map.prototype.Polyline = function(term,path,opts) {
  term.Polyline = new AMap.Polyline({
    path,
    borderWeight: 2, // 线条宽度，默认为 1
    lineJoin: 'round', // 折线拐点连接处样式  
    ...opts
  });
}
Map.prototype.SetPolylinePath = function(Polyline,paths) {
  Polyline.setPath(paths)
}

Map.prototype.destroy = function() {
  this.map.destroy && this.map.destroy()
}

Map.prototype.clearOverLays = function() {
  this.map.clearMap && this.map.clearOverLays()
}

