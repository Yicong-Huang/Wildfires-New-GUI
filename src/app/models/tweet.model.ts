import {JsonConverter, JsonCustomConvert, JsonObject, JsonProperty} from 'json2typescript';
import {LatLng} from 'leaflet';

@JsonConverter
class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  deserialize(unix_timestamp: number): Date {
    return new Date(unix_timestamp * 1000);
  }
}

@JsonObject('Tweet')
export class Tweet {
  @JsonProperty('lng', Number)
  lng: number = null;

  @JsonProperty('id', String)
  private _id: string = null;

  get id(): string {
    return this._id;
  }

  @JsonProperty('createAt', DateConverter)
  private _createAt: Date = null;

  @JsonProperty('lat', Number)
  lat: number = null;

  get createAt(): Date {
    return this._createAt;
  }

  text: string = null;
  text_cnn_wildfire_prob: number = null;

  image: string[] = null;

  user: string = null;

  public getLatLng(): LatLng {
    return new LatLng(this.lat, this.lng);
  }


}
