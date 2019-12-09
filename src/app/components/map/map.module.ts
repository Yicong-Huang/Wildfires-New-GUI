import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {CoreMapComponent} from './core-map/core-map.component';
import {createCustomElement} from '@angular/elements';

import {ClickMarkerComponent} from './click-marker/click-marker.component';
import {FirePolygonLayer} from './layers/fire-polygon.layer';
import {FirePolygonPopupComponent} from './popups/fire-polygon-popup/fire-polygon-popup.component';
import {DateSliderComponent} from './date-slider/date-slider.component';
import {LeafletMarkerClusterModule} from '@asymmetrik/ngx-leaflet-markercluster';
import {Ng5SliderModule} from 'ng5-slider';

@NgModule({
  declarations: [CoreMapComponent, ClickMarkerComponent, FirePolygonPopupComponent, DateSliderComponent],
  imports: [
    CommonModule,
    LeafletModule,
    LeafletMarkerClusterModule,
    Ng5SliderModule
  ],
  exports: [CoreMapComponent],
  providers: [FirePolygonLayer],
  entryComponents: [FirePolygonPopupComponent, DateSliderComponent]
})
export class MapModule {
  constructor(private injector: Injector) {
    const PopupElement = createCustomElement(FirePolygonPopupComponent, {injector});
    // Register the custom element with the browser.
    customElements.define('popup-element', PopupElement);
    const DateSliderElement = createCustomElement(DateSliderComponent, {injector});
    // Register the custom element with the browser.
    customElements.define('dateslider-element', DateSliderElement);
  }
}
