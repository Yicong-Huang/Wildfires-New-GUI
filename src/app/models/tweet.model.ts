import {JsonObject, JsonProperty} from 'json2typescript';
import {LatLng} from 'leaflet';

@JsonObject('Tweet')
export class Tweet {
  @JsonProperty('id', String)
  id: string = null;
  @JsonProperty('create_at', String)
  createAt: string | null = null;
  @JsonProperty('lat', Number)
  lat: number = null;
  @JsonProperty('long', Number)
  lng: number = null;

  public getLatLng(): LatLng {
    return new LatLng(this.lat, this.lng);
  }


}
