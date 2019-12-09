import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {MapModule} from './components/map/map.module';
import {TimeModule} from './components/time/time.module';
import {HttpClientModule} from '@angular/common/http';
import {Ng5SliderModule} from 'ng5-slider';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    MapModule,
    TimeModule,
    HttpClientModule,
    BrowserModule,
    Ng5SliderModule,
    LeafletModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
