import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreMapComponent} from './core-map/core-map.component';

import {ClickMarkerComponent} from './click-marker/click-marker.component';


@NgModule({
  declarations: [CoreMapComponent, ClickMarkerComponent],
  imports: [
    CommonModule,
    LeafletModule,
  ],
  exports: [CoreMapComponent]
})
export class MapModule {
}
