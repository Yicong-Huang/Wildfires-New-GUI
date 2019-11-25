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

  image: string[] = null;

  user: string = null;

  public getLatLng(): LatLng {
    return new LatLng(this.lat, this.lng);
  }

}

@JsonObject('TweetCount')
export class TweetCount {
  @JsonProperty('date', DateConverter)
  private _date: Date = null;

  get date(): Date {
    return this._date;
  }

  @JsonProperty('count', Number)
  private _count: number = null;

  get count(): number {
    return this._count;
  }


}
