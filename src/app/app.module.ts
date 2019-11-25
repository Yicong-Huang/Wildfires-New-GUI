import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {MapModule} from './components/map/map.module';
import {TimeModule} from './components/time/time.module';
import {HttpClientModule, HttpClientJsonpModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    MapModule,
    TimeModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    LeafletModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
