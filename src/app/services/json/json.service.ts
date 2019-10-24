import {Injectable} from '@angular/core';
import {JsonConvert, ValueCheckingMode} from 'json2typescript';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JsonService {
  jsonConvert: JsonConvert;

  constructor() {
    this.jsonConvert = new JsonConvert();
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null
  }

  deserialize<T>(jsonObject: Observable<T[]>, classReference: new() => T): Observable<T[]> {
    return jsonObject.pipe(map((items: T[]) => items.map(item => this.jsonConvert.deserializeObject(item, classReference))));
  }
}
