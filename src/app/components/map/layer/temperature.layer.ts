import {FireService} from '../../../services/fire/fire.service';
import {LayerGroup, Map} from 'leaflet';
import HeatmapOverlay from 'leaflet-heatmap';
import {heatLayer} from 'leaflet-heat-es';

export class TempLayer extends LayerGroup {
  private map;
  private heatmapLayer;

  constructor(private fireService: FireService) {
    super();
  }

  onAdd(map: Map): this {
    this.map = map;
    this.fireService.getTemperatureData().subscribe(data => this.heatmapDataHandler(data));
    //
    // const tempSubject = new Subject();
    // tempSubject.subscribe(this.heatmapDataHandler);
    // this.fireService.getTemperatureData().subscribe(tempSubject);

    return this;
  }

  onRemove(map: Map): this {
    if (this.heatmapLayer) {
      this.heatmapLayer.remove();
    }
    return this;
  }

  heatmapDataHandler = (data) => {
    const newdata = [];
    for (const ev of data){
      const point = [ev.lat, ev.long, ev.temp];
      newdata.push(point);
    }

    let heatmapConfig = heatLayer(newdata,
    {
      radius: 1,
      minOpacity: 0.2,
      blur: 1,
      max: 1.0,
      maxZoom: 1,
      gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
    }).addTo(this.map);
  }


  //
  // heatmapDataHandler = (data) => {
  //   /**
  //    *  Display temp data as a heatmap with color scale.
  //    *
  //    *  Receive data with geolocation and temp value as points with value;
  //    *  showed as different color with customized color scale;
  //    *  use heatmapOverlay class from leaflet-heatmap.
  //    *
  //    *  @param {Object} geolocation value and temp value
  //    *
  //    *  @link https://www.patrick-wied.at/static/heatmapjs/docs.html#heatmap-setData
  //    */
  //   let heatmapConfig = {
  //     radius: 1,
  //     maxOpacity: 0.63,
  //     minOpacity: 0.2,
  //     scaleRadius: true,
  //     useLocalExtrema: false,
  //     blur: 1,
  //     latField: 'lat',
  //     lngField: 'long',
  //     valueField: 'temp',
  //     // gradient is customized to match the color scales of temp plotting layers exactly the same
  //     gradient: {
  //       '.1': '#393fb8',
  //       '.2': '#45afd6',
  //       '.3': '#49ebd8',
  //       '.4': '#49eb8f',
  //       '.5': '#a6e34b',
  //       '.55': '#f2de5a',
  //       '.6': '#edbf18',
  //       '.65': '#e89c20',
  //       '.7': '#f27f02',
  //       '.75': '#f25a02',
  //       '.8': '#f23a02',
  //       '.85': '#f0077f',
  //       '.9': '#f205c3',
  //       '.99': '#9306ba',
  //     }
  //   };
  //   const da = data;
  //   console.log(da);
  //   this.heatmapLayer = new HeatmapOverlay(heatmapConfig);
  //   const datas = {max: 680, data: da};
  //   // 'max' should be far higher than the upper domain of data, to make the color distinguish each different data
  //   this.heatmapLayer.setData(datas);
  //   this.heatmapLayer.addTo(this.map);
  // }

}
