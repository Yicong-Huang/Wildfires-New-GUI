import {Component, Input, OnInit} from '@angular/core';
import {FireService} from '../../../services/fire/fire.service';
import {MapService} from '../../../services/map/map.service';

@Component({
  selector: 'popup-box',
  templateUrl: './popup-box.component.html',
  styleUrls: ['./popup-box.component.css']
})
export class PopupBoxComponent implements OnInit {
  @ Input() fireId: string;

  constructor(private fireService: FireService, private mapService: MapService) {
  }

  ngOnInit() {
    this.fireId = this.fireId;
  }

  click() {
    this.fireService.getFireBoundingBox(this.fireId).subscribe(this.mapZoomInHandler);
  }

  mapZoomInHandler = (data) => {
    console.log(data);
    const bbox = data[0].bbox.coordinates[0];
    const firePolygonLL = [];
    for (const item of bbox) {// changes the lat and lng because the geojson format is different to the leaflet latlng format
      firePolygonLL.push([parseFloat(item[1]), parseFloat(item[0])]);
    }
    this.mapService.zoom(firePolygonLL);
  }
}

