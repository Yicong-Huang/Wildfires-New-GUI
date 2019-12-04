import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreMapComponent} from './core-map/core-map.component';
import {createCustomElement} from '@angular/elements';

import {ClickMarkerComponent} from './click-marker/click-marker.component';
import {FirePolygonLayer} from './layers/fire-polygon.layer';
import {FirePolygonPopupComponent} from './popups/fire-polygon-popup/fire-polygon-popup.component';

import {LeafletMarkerClusterModule} from '@asymmetrik/ngx-leaflet-markercluster';

@NgModule({
  declarations: [CoreMapComponent, ClickMarkerComponent, FirePolygonPopupComponent],
  imports: [
    CommonModule,
    LeafletModule,
    LeafletMarkerClusterModule
  ],
  exports: [CoreMapComponent],
  providers: [FirePolygonLayer],
  entryComponents: [FirePolygonPopupComponent]
})
export class MapModule {
  constructor(private injector: Injector) {
    const PopupElement = createCustomElement(FirePolygonPopupComponent, {injector});
    // Register the custom element with the browser.
    customElements.define('popup-element', PopupElement);
  }
}
