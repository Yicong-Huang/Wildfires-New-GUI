import {GeoJSON, geoJSON, icon, latLng, LayerGroup, Map, marker, Marker} from 'leaflet';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';
import {NgElement, WithProperties} from '@angular/elements';
import {PopupBoxComponent} from '../popup-box/popup-box.component';
import {MapService} from '../../../services/map/map.service';

export class FirePolygonLayer extends LayerGroup {

  private zoomOutLevel = 5;

  private polygons: GeoJSON[];
  private polygon: GeoJSON;
  private markers: Marker[] = [];
  private startDate;
  private endDate;
  private map;
  private zoomOutCenter = [33.64, -117.84];

  constructor(private timeService: TimeService, private fireService: FireService, private mapService: MapService) {
    super();
    this.timeService.timeRangeChange.subscribe(this.timeRangeChangeFirePolygonHandler);
    this.fireService.getMultiplePolygonEvent.subscribe(this.getMultiplePolygon);

  }

  onAdd(map: Map): this {
    this.map = map;
    this.map.on('zoomend, moveend', this.getFirePolygonOnceMoved);
    this.polygons = [];
    const [start, end] = this.timeService.getRangeDate();
    this.startDate = start;
    this.endDate = end;
    this.getFirePolygonData();
    return this;
  }

  onRemove(map: Map): this {
    console.log('on remove');
    if (this.polygon) {
      this.polygon.remove();
    }
    if (this.markers) {
      this.markers.forEach(circle => circle.remove());
    }
    return this;
  }

  firePolygonDataHandler = (data) => {
    // adds the fire polygon to the map, the accuracy is based on the zoom level
    if (this.polygon) {
      this.polygon.remove();
    }
    if (this.markers) {
      this.markers.forEach(circle => circle.remove());
    }
    if (this.map.getZoom() < 8) {
      for (const singlePoint of data.features) {
        const latlng = latLng(singlePoint.geometry.coordinates[1], singlePoint.geometry.coordinates[0]);
        const size = this.map.getZoom() * this.map.getZoom();
        const fireIcon = icon({
          iconUrl: 'assets/image/pixelfire.gif',
          iconSize: [size, size],
        });
        const singleMarker = marker(latlng, {icon: fireIcon}).bindPopup(fl => {
          const popupEl: NgElement & WithProperties<PopupBoxComponent> = document.createElement('popup-element') as any;
          popupEl.fireId = singlePoint.id;
          popupEl.message = `zoom in`;
          this.zoomOutCenter = this.map.getCenter();
          this.zoomOutLevel = this.map.getZoom();
          document.body.appendChild(popupEl);
          return popupEl;
        }).openPopup();
        singleMarker.addTo(this.map);
        this.markers.push(singleMarker);
      }
    } else {
      data.type = 'Polygon';
      this.polygon = geoJSON(data, {
        style: () => ({
          fillColor: 'yellow',
          weight: 2,
          opacity: 0.8,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.5
        }), onEachFeature: this.onEachFeature
      }).addTo(this.map);
    }
  };

  bindPopupBox = (feature, layer) => {
    layer.bindPopup(fl => {
      const popupEl: NgElement & WithProperties<PopupBoxComponent> = document.createElement('popup-element') as any;
      // Listen to the close event
      popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));
      popupEl.message = `zoom out`;
      popupEl.zoomOutCenter = this.zoomOutCenter;
      popupEl.zoomOutLevel = this.zoomOutLevel;
      popupEl.fireId = feature.id;
      // Add to the DOM
      document.body.appendChild(popupEl);
      return popupEl;
    });
  };

  onEachFeature = (feature, layer) => {
    console.log(feature);
    console.log(layer);
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
      click: this.zoomToFeature
    });
    this.bindPopupBox(feature, layer);
    // controls the interaction between the mouse and the map
  };
  highlightFeature = (event) => {
    // highlights the region when the mouse moves over the region
    const layer = event.target;
    layer.setStyle({
      weight: 5,
      color: '#e37927',
      dashArray: '',
      fillOpacity: 0.7
    });

  };
  resetHighlight = (event) => {
    // gets rid of the highlight when the mouse moves out of the region
    this.polygon.resetStyle(event.target);
  };

  zoomToFeature = (event) => {
    this.mapService.zoomIn(event.target.getBounds());
    // this.bindPopupBox(event.sourceTarget.feature, event.sourceTarget);
  };

  timeRangeChangeFirePolygonHandler = ({start, end}) => {
    this.startDate = start;
    this.endDate = end;
    this.getFirePolygonData();
  };

  getMultiplePolygon = (id) => {
    this.fireService.searchSeparatedFirePolygon(id, 2).subscribe(this.firePolygonDataHandler);
  };

  getFirePolygonData() {
    const zoom = this.map.getZoom();
    let size;
    if (zoom < 8) {
      size = 4;
    } else if (zoom < 9) {
      size = 3;
    } else {
      size = 2;
    }
    // processes given time data from time-series
    // const [start, end] = this.timeService.getRangeDate();
    const dateStartInISO = new Date(this.startDate).toISOString();
    const dateEndInISO = new Date(this.endDate).toISOString();
    const bound = this.map.getBounds();
    const boundNE = {lat: bound._northEast.lat, lon: bound._northEast.lng};
    const boundSW = {lat: bound._southWest.lat, lon: bound._southWest.lng};
    this.fireService.getFirePolygonData(boundNE, boundSW, size,
      dateStartInISO, dateEndInISO).subscribe((event) => this.firePolygonDataHandler(event));
  }

  getFirePolygonOnceMoved = () => {
    if (this.startDate && this.endDate) {
      this.getFirePolygonData();
    }
  };

}

