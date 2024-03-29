/**
 * @Summary: TimeService as one separate service that allows other components to get time.
 *
 * @Description: Initial current time range from previous 6 months to present.
 *
 * @Author: (Hugo) Qiaonan Huang
 *
 * Last modified  : 2019-08-27 15:31:40
 */

import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * @param currentDateInYMD    Current date in yyyy-mm-dd, used in click event in time series.
 * @param rangeStartDateInMS  Range start time in millisecond, used in selection event in time series.
 * @param rangeEndDateInMS    Range end time in millisecond, used in selection event in time series.
 *
 */
export class TimeService {
  public timeRangeChangeEvent$ = new EventEmitter();
  private currentDateInYMD = undefined;
  private rangeStartDateInMS = new Date().getTime() - 30 * 24 * 3600 * 1000; // latest 1 month
  private rangeEndDateInMS = new Date().getTime();

  setCurrentDate(dateInYMD: string): void {
    this.currentDateInYMD = dateInYMD;
  }

  setRangeDate(startInMs: number, endInMs: number): void {
    this.rangeStartDateInMS = startInMs;
    this.rangeEndDateInMS = endInMs;
  }

  getCurrentDate(): string {
    return this.currentDateInYMD !== undefined ? this.currentDateInYMD : new Date().toISOString().substring(0, 10);
  }

  getRangeDate(): [number, number] {
    return [this.rangeStartDateInMS, this.rangeEndDateInMS];
  }

  sendTimeRange() {
    this.timeRangeChangeEvent$.next({start: this.rangeStartDateInMS, end: this.rangeEndDateInMS});
  }
}

