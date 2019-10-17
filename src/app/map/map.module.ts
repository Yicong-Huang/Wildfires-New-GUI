import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreMapComponent} from './core-map/core-map.component';

import {ClickMarkerComponent} from './click-marker/click-marker.component';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';


@NgModule({
  declarations: [CoreMapComponent, ClickMarkerComponent],
  imports: [
    CommonModule,
    LeafletModule,
    LeafletDrawModule
  ],
  exports: [CoreMapComponent]
})
export class MapModule {
}
