import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreMapComponent} from './core-map/core-map.component';

import {ClickMarkerComponent} from './click-marker/click-marker.component';
import {FirePolygonLayer} from './layer/fire-polygon.layer';


@NgModule({
  declarations: [CoreMapComponent, ClickMarkerComponent],
  imports: [
    CommonModule,
    LeafletModule,
  ],
  exports: [CoreMapComponent],
  providers: [FirePolygonLayer]
})
export class MapModule {
}
