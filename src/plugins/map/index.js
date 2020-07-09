import GD from "../tsmap/gaodei"
import Tian from "../tsmap/tian"
import ArcGIS from "../tsmap/arcgis"

let Map;

if (!window.config_map || window.config_map == "GD") {
  Map = new GD()
} else if (window.config_map == "Tian") {
  Map = new Tian()
} else if (window.config_map == "Arcgis") {
  Map = new ArcGIS()
}

console.log("Map: ",Map)


export default Map
