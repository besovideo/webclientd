
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

export function Map() {
  var map = undefined
}

Map.prototype.Init = function (ele,opts){
  return new Promise((resolve,reject)=>{
    loadScript().then(T=>{
      this.map = new T.Map(ele,{
        projection: opts.projection || "EPSG:4326"
      })
      this.map.centerAndZoom(new T.LngLat(116.40769, 39.89945), 6);
      resolve(this.map)
    })
  })
}


Map.prototype.LngLat = async function LngLat(lng,lat) {
  return new T.LngLat(lng,lat)
}

Map.prototype.ChangeLocation = async function (marker,resLnglat,info) {
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


Map.prototype.SetMarkerAndInfo = function(Obj, resLnglat, label_name,info, openInfoWindow = true) {
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

Map.prototype.openInfoWindow = async function(marker) {
  marker.openInfoWindow(marker.infoWindow)
}

Map.prototype.closeInfoWindow = async function(marker) {
  marker.closeInfoWindow()
}

Map.prototype.getLngLat = function(marker) {
  return marker.getLngLat()
}

Map.prototype.setFitView = function(arrmarker,LngLat) {
  this.map.panTo(LngLat);
}
// Map.prototype.



Map.prototype.removeOverLay = function(marker) {
  this.map.removeOverLay(marker);
}

Map.prototype.addOverLay = function(any) {
  this.map.addOverLay(any);
}


Map.prototype.Polyline = function(term,path,opts) {
  term.Polyline = new T.Polyline(path, {
   ...opts
  });
}
Map.prototype.SetPolylinePath = function(Polyline,paths) {
  Polyline.setLngLats(paths)
}

Map.prototype.destroy = function() {
  this.map.destroy && this.map.destroy()
}

Map.prototype.clearOverLays = function() {
  this.map.clearOverLays && this.map.clearOverLays()
}