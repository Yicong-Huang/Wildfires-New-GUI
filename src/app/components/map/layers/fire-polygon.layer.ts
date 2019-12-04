import {GeoJSON, geoJSON, icon, LatLng, latLng, Layer, LayerGroup, LeafletMouseEvent, Map, marker, Marker,} from 'leaflet';
import {TimeService} from '../../../services/time/time.service';
import {FireService} from '../../../services/fire/fire.service';
import {NgElement, WithProperties} from '@angular/elements';
import {FirePolygonPopupComponent} from '../popups/fire-polygon-popup/fire-polygon-popup.component';
import {MapService} from '../../../services/map/map.service';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export class FirePolygonLayer extends LayerGroup {

  private zoomOutLevel = 5;
  private polygon: GeoJSON;
  private markers: Marker[] = [];
  private startDate: number;
  private endDate: number;
  private map: Map;
  private zoomOutCenter: LatLng = new LatLng(33.64, -117.84);
  private subscriptions: Subscription[] = [];
  private customIconURL: string;
  private prevFeature = new Set();

  constructor(private timeService: TimeService, private fireService: FireService, private mapService: MapService) {
    super();
  }

  onAdd(map: Map): this {
    if (this.map === undefined) {
      this.map = map;
    }
    this.subscriptions.push(fromEvent(this.map, 'zoomend, moveend').pipe(switchMap(
      () => this.getFirePolygonOnceMoved())).subscribe((event) => this.firePolygonDataHandler(event)));
    this.subscriptions.push(this.timeService.timeRangeChange$.pipe(
      switchMap((time) => this.timeRangeChangeFirePolygonHandler(time)))
      .subscribe((event) => this.firePolygonDataHandler(event)));

    const [start, end] = this.timeService.getRangeDate();
    this.startDate = start;
    this.endDate = end;
    this.subscriptions.push(this.getFirePolygonData().subscribe((event) => this.firePolygonDataHandler(event)));
    this.subscriptions.push(this.fireService.getMultiplePolygonEvent.subscribe(this.getMultiplePolygon));
    return this;
  }

  onRemove(map: Map): this {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];
    if (this.polygon !== undefined) {
      this.polygon.remove();
    }
    if (this.markers !== undefined) {
      this.markers.forEach((circle: Marker) => circle.remove());
    }
    return this;
  }

  firePolygonDataHandler = (data) => {
    // adds the fire polygon to the map, the accuracy is based on the zoom level
    if (data !== undefined) {
      if (this.map.getZoom() < 8) {
        if (this.polygon) {
          this.polygon.remove();
          this.prevFeature.clear();
        }
        const newMarkers: Marker[] = [];
        for (const singlePoint of data.features) {
          singlePoint.type = 'Point';
          const latlng = latLng(singlePoint.geometry.coordinates[1], singlePoint.geometry.coordinates[0]);
          const size = this.map.getZoom() * this.map.getZoom();
          const currentDate: Date = new Date();
          const endTime: Date = new Date(singlePoint.properties.endtime);
          const dateDifference: number = (currentDate.getTime() - endTime.getTime()) / (1000 * 24 * 3600);
          this.customIconURL = `../../../../assets/image/fireIcon${dateDifference <= 31 ? 1 : 2}.png`;

          const fireIcon = icon({
            iconUrl: this.customIconURL,
            iconSize: [0.5 * size, 0.5 * size],
            className: 'my-div-icon',
          });
          const singleMarker = marker(latlng, {icon: fireIcon}).bindPopup(fl => {
            const popupEl: NgElement & WithProperties<FirePolygonPopupComponent> = document.createElement('popup-element') as any;
            popupEl.fireId = singlePoint.id;
            popupEl.message = 'zoom in';
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
          singleMarker.on('mouseover', (ev) => {
            const iconBig = singleMarker.options.icon;
            iconBig.options.iconSize = [size, size];
            singleMarker.setIcon(iconBig);
          });
          singleMarker.on('mouseout', (ev) => {
            const iconSmall = singleMarker.options.icon;
            iconSmall.options.iconSize = [0.5 * size, 0.5 * size];
            singleMarker.setIcon(iconSmall);
          });
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
        let polygonUpdate = false;
        for (const feature of data.features) {
          if (!this.prevFeature.has(feature.id)) {
            polygonUpdate = true;
            break;
          } else {
            this.prevFeature.delete(feature.id);
          }
        }
        if (polygonUpdate) {
          if (this.polygon) {
            this.polygon.remove();
          }
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
        for (const feature of data.features) {
          this.prevFeature.add(feature.id);
        }
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
    return this.getFirePolygonData();
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
    return this.getFirePolygonData();
  };
}

