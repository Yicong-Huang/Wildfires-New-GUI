import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('TweetCount')
export class TweetCount {
  @JsonProperty('date', String)
  public date: string;
  @JsonProperty('count', Number)
  public count: number;

}
