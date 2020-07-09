export default class BVMap implements BvMap {
  public map:any
  
  constructor(){
    
  }
  LoadScript(key: string=""): Promise<any> {
    var style1 = document.createElement('link');
    style1.href = window.arcgis_api_path + "dijit/themes/claro/claro.css";
    style1.rel = 'stylesheet';
    style1.type = 'text/css';
    document.getElementsByTagName("head")[0].appendChild(style1);

    var style2 = document.createElement('link');
    style2.href = window.arcgis_api_path + "esri/css/esri.css";
    style2.rel = 'stylesheet';
    style2.type = 'text/css';
    document.getElementsByTagName("head")[0].appendChild(style2);

    return new Promise(function(resolve, reject) {
      console.log("loading script")
      if (document.querySelector("#_Map")) {
        resolve(window.ArcGISApi);
        return;
      }
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.id = "_Map";
      script.src = window.arcgis_api_path +  "init.js"
      script.onload = () => {
        console.log("Arcgis onload");
        window.require(["tdlib/TDLayer",
          "tdlib/TDLayer2014",
          "tdlib/TDLayer2012",
          "tdlib/TDLayer2008",
          "tdlib/TDLayerGj",
          "tdlib/SlLayer",
          "tdlib/TDAnnoLayer",
          "esri/geometry/Point",
          "esri/geometry/Polyline",
          "esri/map",
          "dojo/dom-construct",
          "esri/dijit/Popup",
          "esri/symbols/SimpleFillSymbol",
          "esri/symbols/SimpleLineSymbol",
          "esri/Color",
          "esri/layers/ArcGISDynamicMapServiceLayer",
          "esri/layers/FeatureLayer",
          "esri/layers/GraphicsLayer",
          "esri/toolbars/draw",
          "dojo/number",
          "esri/tasks/GeometryService",
          "esri/tasks/LengthsParameters",
          "esri/graphic",
          "esri/geometry/Geometry",
          "esri/SpatialReference",
          "dojo/_base/lang",
          "esri/tasks/AreasAndLengthsParameters",
          "esri/symbols/Font",
          "dojo/dom", "dojo/on",
          "esri/tasks/query",
          "esri/tasks/QueryTask",
          "dojo/promise/all",
          "esri/symbols/PictureMarkerSymbol",
          "esri/tasks/RouteTask",
          "esri/tasks/RouteParameters",
          "esri/tasks/FeatureSet",
          "dojo/_base/array",
          "esri/symbols/SimpleMarkerSymbol",
          "esri/layers/LabelClass",
          "esri/symbols/TextSymbol",
          "dojo/domReady!",
          "esri/InfoTemplate"
      ],
      function (TDTLayer,
        TDTLayer2014,
        TDTLayer2012,
        TDTLayer2008,
        TDTLayerGj,
        SlLayer,
        TDTAnnoLayer,
        Point,
        Polyline,
        Map,
        domConstruct,
        Popup,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        ArcGISDynamicMapServiceLayer,
        FeatureLayer,
        GraphicsLayer,
        Draw,
        number,
        GeometryService,
        LengthsParameters,
        Graphic,
        Geometry,
        SpatialReference,
        lang,
        AreasAndLengthsParameters,
        Font,
        dom, on,
        Query, QueryTask, all,
        PictureMarkerSymbol,
        RouteTask,
        RouteParameters,
        FeatureSet,
        array,
        SimpleMarkerSymbol,
        LabelClass,
        TextSymbol,
        graphicsUtils,
        InfoTemplate){
          let ArcGISApi:any = {
            TDTLayer,
            TDTLayer2014,
            TDTLayer2012,
            TDTLayer2008,
            TDTLayerGj,
            SlLayer,
            TDTAnnoLayer,
            Point,
            Polyline,
            Map,
            domConstruct,
            Popup,
            SimpleFillSymbol,
            SimpleLineSymbol,
            Color,
            ArcGISDynamicMapServiceLayer,
            FeatureLayer,
            GraphicsLayer,
            Draw,
            number,
            GeometryService,
            LengthsParameters,
            Graphic,
            Geometry,
            SpatialReference,
            lang,
            AreasAndLengthsParameters,
            Font,
            dom, on,
            Query, QueryTask, all,
            PictureMarkerSymbol,
            RouteTask,
            RouteParameters,
            FeatureSet,
            array,
            SimpleMarkerSymbol,
            LabelClass,
            TextSymbol,
            InfoTemplate,
            graphicsUtils
          } 
          console.log(ArcGISApi)
          window.ArcGISApi = ArcGISApi

          window.sendParams = function() {
            window.MapInitCallback(TDTLayer,
              TDTLayer2014,
              TDTLayer2012,
              TDTLayer2008,
              TDTLayerGj,
              SlLayer,
              TDTAnnoLayer,
              Point,
              Map,
              domConstruct,
              Popup,
              SimpleFillSymbol,
              SimpleLineSymbol,
              Color,
              ArcGISDynamicMapServiceLayer,
              FeatureLayer,
              GraphicsLayer,
              Draw,
              number,
              GeometryService,
              LengthsParameters,
              Graphic,
              Geometry,
              SpatialReference,
              lang,
              AreasAndLengthsParameters,
              Font,
              dom, on,
              Query, QueryTask, all,
              PictureMarkerSymbol,
              RouteTask,
              RouteParameters,
              FeatureSet,
              array,
              SimpleMarkerSymbol,
              LabelClass,
              TextSymbol,
              InfoTemplate,
              Polyline,
              graphicsUtils)
          }
          
          resolve(window.ArcGISApi);
        })
        
      }
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  Init(ele: string,opts: any): Promise<object> {
    return new Promise((resolve,reject)=>{
      this.LoadScript().then(ArcGISApi=>{
        
        this.map = new ArcGISApi.Map(ele,{
          logo: false,
          slider: false,
          showLabels: true
        })
        var gjLayer = new ArcGISApi.TDTLayerGj();
        this.map.addLayer(gjLayer, 0);
        var basemap = new ArcGISApi.TDTLayer();
        this.map.addLayer(basemap, 1);
        var annolayer = new ArcGISApi.TDTAnnoLayer();
        this.map.addLayer(annolayer, 2);

        window.map = this.map

        this.map.centerAndZoom(new ArcGISApi.Point({ "x": window.arcgis_api_path.x || 117.344, "y":  window.arcgis_api_path.y || 36.897, "spatialReference": { "wkid": 4326 } }),window.arcgis_api_path.zoom || 6);
        // this.map.centerAndZoom(new ArcGISApi.Point({ "x": 117.198142, "y": 31.851985, "spatialReference": { "wkid": 4326 } }), 6);
        resolve(this.map)
        window.sendParams()

      }).catch(err=>{})
    })
  }
  async LngLat(lng: number, lat: number): Promise<object> {
    return new ArcGISApi.Point(lng,lat,new ArcGISApi.SpatialReference({ wkid: 4326 }))
  }
  ChangeLocation(marker: any, resLnglat: any, info: string): void {
    // if (resLnglat.equals(marker.getLngLat())) {
    //   return;
    // }
    let isopen = this.map.infoWindow.isShowing;
    // if (isopen) {
    //   this.map.infoWindow.hide();
    // }
    marker.resLnglat = resLnglat;
    marker._label && marker._label.setGeometry(resLnglat);
  
    this.map.infoWindow.domNode.querySelector(".contentPane").innerHTML = info
  
    console.log("setLnglat ", resLnglat);
    marker.setGeometry(resLnglat);
    
    // if (isopen) {
    //   this.map.infoWindow.show(this.map.toScreen(resLnglat))
    //   // marker.openInfoWindow.call(marker, marker.infoWindow);
    // }
  }
  SetMarkerAndInfo(Obj: any, resLnglat: object, label_name: string, info: string, openInfoWindow: boolean): void {
    
    
    var infoTemplate = new esri.InfoTemplate("${name}", "${content}");
    var pictureMarkerSymbol = new ArcGISApi.PictureMarkerSymbol({ url: 'img/Marker.png', width: 20, height: 20 });

    let createTextSymbol:any = (color, size, offset,content) => {
        var textSize = size + "pt";
        var textSymbol = new ArcGISApi.TextSymbol(content).setColor(new ArcGISApi.Color("#fff"));
        textSymbol.font.setSize(textSize);
        textSymbol.setHaloColor(new ArcGISApi.Color(color)).setHaloSize(1);
        textSymbol.yoffset = offset ? offset.y : null;
        textSymbol.xoffset = offset ? offset.x : null;
        return textSymbol;
    }
    var TextSymbol = createTextSymbol("blue", 11, {x: 3, y: -25}, label_name);
    var graphic = new ArcGISApi.Graphic(resLnglat, pictureMarkerSymbol,{name: label_name,content: info},infoTemplate);
    var label = new ArcGISApi.Graphic(resLnglat, TextSymbol);
    graphic._label = label
    this.map.graphics.add(graphic);
    this.map.graphics.add(label);
    

  
    graphic.resLnglat = resLnglat;
   
    Obj.marker = graphic
  }
  openInfoWindow(marker: any): void {
    // this.map.infoWindow.show(this.map.toScreen(marker.geometry))
    // marker.openInfoWindow(marker.infoWindow)
  }
  closeInfoWindow(marker: any): void {
    this.map.infoWindow.hide()
  }
  getLngLat(marker: any): object {
    return marker.geometry
  }
  setFitView(marker: any,LngLat: any): void {
    
    this.map.centerAt(marker[0].geometry);
  }
  removeOverLay(marker: any): void {
    this.map.graphics.remove(marker);
    marker._label && this.map.graphics.remove(marker._label)

  }
  addOverLay(any: any): void {
    this.map.graphics.add(any);

  }
  Polyline(obj: any, path: object[], opts: any): void {
    let arr = []

    for(let i of path) {
      arr.push([i['x'],i['y']])
    }
    let symbol = new ArcGISApi.SimpleLineSymbol(ArcGISApi.SimpleLineSymbol.STYLE_SOLID, new ArcGISApi.Color([255,255,0]), 2);
    let polyline = new ArcGISApi.Polyline(arr)
    
    obj.Polyline = new ArcGISApi.Graphic(polyline, symbol);
    this.map.graphics.add(obj.Polyline);
    console.log(obj.Polyline)
  }
  SetPolylinePath(Polyline: any, paths: object[]): void {
    this.map.graphics.remove(Polyline)
    
    let arr = []
    for(let i of paths) {
      arr.push([i['x'],i['y']])
    }
    Polyline.geometry.paths = [arr]

    this.map.graphics.add(Polyline)
  }
  destroy(): void {
    this.map.destroy && this.map.destroy()
  }
  clearOverLays(): void {
    this.map.graphics.clear() && this.map.graphics.clear()
  }
  
}