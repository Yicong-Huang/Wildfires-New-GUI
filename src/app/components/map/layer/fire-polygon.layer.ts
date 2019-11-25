import {
  GeoJSON,
  geoJSON,
  icon,
  LatLng,
  latLng,
  Layer,
  LayerGroup,
  LeafletMouseEvent,
  Map,
  marker,
  Marker,
  Point,
} from 'leaflet';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';
import {NgElement, WithProperties} from '@angular/elements';
import {FirePolygonPopupComponent} from '../fire-polygon-popup/fire-polygon-popup.component';
import {MapService} from '../../../services/map/map.service';
import {fromEvent, Observable, of, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export class FirePolygonLayer extends LayerGroup {

  private zoomOutLevel = 5;
  private polygon: GeoJSON;
  private markers: Marker[] = [];
  private startDate: number;
  private endDate: number;
  private map: Map;
  private zoomOutCenter: LatLng = new LatLng(33.64, -117.84);
  private isOn: boolean;
  private timeRangeChangeSubscription: Subscription;
  private mapChangeSubscription: Subscription;

  constructor(private timeService: TimeService, private fireService: FireService, private mapService: MapService) {
    super();
    this.fireService.getMultiplePolygonEvent.subscribe(this.getMultiplePolygon);
  }

  onAdd(map: Map): this {
    this.isOn = true;
    if (this.map === undefined) {
      this.map = map;
      this.mapChangeSubscription = fromEvent(this.map, 'zoomend, moveend').pipe(switchMap(
        () => this.getFirePolygonOnceMoved())).subscribe((event) => this.firePolygonDataHandler(event));
      this.timeRangeChangeSubscription = this.timeService.timeRangeChange$.pipe(
        switchMap((time) => this.timeRangeChangeFirePolygonHandler(time)))
        .subscribe((event) => this.firePolygonDataHandler(event));
    }
    const [start, end] = this.timeService.getRangeDate();
    this.startDate = start;
    this.endDate = end;
    this.getFirePolygonData().subscribe((event) => this.firePolygonDataHandler(event));
    return this;
  }

  onRemove(map: Map): this {
    this.timeRangeChangeSubscription.unsubscribe();
    this.mapChangeSubscription.unsubscribe();
    console.log(this.polygon);
    if (this.polygon !== undefined) {
      this.polygon.remove();
    }

    if (this.markers !== undefined) {
      this.markers.forEach((circle: Marker) => circle.remove());
    }
    this.isOn = false;
    return this;
  }

  firePolygonDataHandler = (data) => {
    // adds the fire polygon to the map, the accuracy is based on the zoom level
    if (this.isOn && data !== undefined) {
      if (this.polygon) {
        this.polygon.remove();
      }
      if (this.map.getZoom() < 8) {
        const newMarkers: Marker[] = [];
        for (const singlePoint of data.features) {
          singlePoint.type = 'Point';
          const latlng = latLng(singlePoint.geometry.coordinates[1], singlePoint.geometry.coordinates[0]);
          const size = this.map.getZoom() * this.map.getZoom();
          const fireIcon = icon({
            iconUrl: 'assets/image/pixelfire.gif',
            iconSize: [size, size],
          });
          const singleMarker = marker(latlng, {icon: fireIcon}).bindPopup(fl => {
            const popupEl: NgElement & WithProperties<FirePolygonPopupComponent> = document.createElement('popup-element') as any;
            popupEl.fireId = singlePoint.id;
            popupEl.message = `zoom in`;
            popupEl.fireName = singlePoint.properties.name;
            popupEl.fireStartTime = singlePoint.properties.starttime;
            popupEl.fireEndTime = singlePoint.properties.endtime;
            popupEl.fireArea = singlePoint.properties.area + ' acres';
            popupEl.fireAgency = singlePoint.properties.agency;
            this.zoomOutCenter = this.map.getCenter();
            this.zoomOutLevel = this.map.getZoom();
            document.body.appendChild(popupEl);
            return popupEl;
          }).openPopup();
          newMarkers.push(singleMarker);
        }
        for (const m of this.markers) {
          this.map.removeLayer(m);
        }

        for (const m of newMarkers) {
          this.map.addLayer(m);
        }

        this.markers = newMarkers;
      } else {
        for (const m of this.markers) {
          this.map.removeLayer(m);
        }
        console.log(data);
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
    }
  };

  bindPopupBox = (feature: GeoJSON.Feature, layer: Layer) => {
    layer.bindPopup(fl => {
      const popupEl: NgElement & WithProperties<FirePolygonPopupComponent> = document.createElement('popup-element') as any;
      popupEl.message = `zoom out`;
      popupEl.zoomOutCenter = this.zoomOutCenter;
      popupEl.zoomOutLevel = this.zoomOutLevel;
      popupEl.fireId = feature.id;
      popupEl.fireName = feature.properties.name;
      popupEl.fireStartTime = feature.properties.starttime;
      popupEl.fireEndTime = feature.properties.endtime;
      popupEl.fireArea = feature.properties.area + ' acres';
      popupEl.fireAgency = feature.properties.agency;
      return popupEl;
    });
  };


  onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
    });
    this.bindPopupBox(feature, layer);
  };


  highlightFeature = (event: LeafletMouseEvent) => {
    // highlights the region when the mouse moves over the region
    const layer = event.target;
    layer.setStyle({
      weight: 5,
      color: '#e37927',
      dashArray: '',
      fillOpacity: 0.7
    });

  };
  resetHighlight = (event: LeafletMouseEvent) => {
    // gets rid of the highlight when the mouse moves out of the region
    this.polygon.resetStyle(event.target);
  };


  timeRangeChangeFirePolygonHandler = ({start, end}): Observable<any> => {
    this.startDate = start;
    this.endDate = end;
    return (this.isOn) ? this.getFirePolygonData() : of(undefined);
  };

  getMultiplePolygon = (id) => {
    this.fireService.searchSeparatedFirePolygon(id, 2).subscribe(this.firePolygonDataHandler);
  };

  getFirePolygonData(): Observable<any> {
    const zoom = this.map.getZoom();
    const size = zoom < 8 ? 4 : zoom < 9 ? 3 : 2;
    // processes given time data from time-series
    const dateStartInISO = new Date(this.startDate).toISOString();
    const dateEndInISO = new Date(this.endDate).toISOString();
    const bound = this.map.getBounds();
    const boundNE = {lat: bound.getNorthEast().lat, lon: bound.getNorthEast().lng};
    const boundSW = {lat: bound.getSouthWest().lat, lon: bound.getSouthWest().lng};
    return this.fireService.getFirePolygonData(boundNE, boundSW, size, dateStartInISO, dateEndInISO);
  }

  getFirePolygonOnceMoved = (): Observable<any> => {
    return (this.isOn && this.startDate && this.endDate) ? this.getFirePolygonData() : of(undefined);
  };

}

