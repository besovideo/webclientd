interface BvMap {
  LoadScript(key :string) :Promise<any> 
  Init(ele: string,opts: any) :Promise<object> 
  LngLat(lng: number, lat: number) :Promise<object> 
  ChangeLocation(marker: any, resLnglat: any,info: string) :void
  SetMarkerAndInfo(Obj: any, resLnglat: object, label_name: string, info: string, openInfoWindow: boolean) :void
  openInfoWindow(marker: any): void
  closeInfoWindow(marker: any): void
  getLngLat(marker: any): object
  setFitView(marker: any,LngLat: any): void
  removeOverLay(marker: any): void
  addOverLay(marker: any): void
  Polyline(obj: any,path: Array<object>,opts: any): void
  SetPolylinePath(Polyline: any, paths: Array<object>): void
  destroy(): void
  clearOverLays(): void
} 