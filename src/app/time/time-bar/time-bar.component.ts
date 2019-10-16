/**
 * @Summary: Time chart that can be used to select time range.
 *
 * @Author: (Hugo) Qiaonan Huang, Yang Cao
 *
 * Last modified  : 2019-08-27 15:31:40
 */

import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import * as $ from 'jquery';
import {MapService} from '../../services/map-service/map.service';
import {TimeService} from '../../services/time/time.service';
import {Tweet} from '../../models/tweet.model';

import * as Highcharts from 'highcharts/highstock';

@Component({
  selector: 'app-time-bar',
  templateUrl: './time-bar.component.html',
  styleUrls: ['./time-bar.component.css']
})
export class TimeBarComponent implements OnInit {
  @Input() start: string;
  @Input() end: string;
  @Output() timeRangeChange = new EventEmitter();
  private halfUnit = 86400000 / 2;
  private currentTick = undefined;
  private hasPlotBand = false;

  constructor(private mapService: MapService, private timeService: TimeService) {
  }

  ngOnInit() {
    /** Subscribe tweet data related to wildfire in service. */
    this.mapService.getDateCountData().subscribe(data => this.drawTimeBar(data));
  }

  /**
   * Using tweet data to draw a time bar reflecting daily tweet information
   *
   * Get data from backend and do the data retrieval of time to a specific date.
   * Count wildfire related tweets and draw it as a time bar chart to visualize.
   *
   * @param tweets tweet data crawled using tweet api
   *
   */
  drawTimeBar = (dateAndCount) => {
    /** replace */
    /**
     *  Refine tweet data to count related to 'wildfire' in each DAY,
     *  storing in charData.
     */
    const chartData = [];
    Object.keys(dateAndCount).forEach(key => {
      chartData.push([new Date(key).getTime(), dateAndCount[key]]);
    });
    console.log(chartData);
    // const chartData = [];
    // const dailyCount = {};
    // for (const tweet of tweets) {
    //     const createAt = tweet.create_at.split('T')[0];
    //     if (dailyCount.hasOwnProperty(createAt)) {
    //         dailyCount[createAt]++;
    //     } else {
    //         dailyCount[createAt] = 1;
    //     }
    // }
    // Object.keys(dailyCount).sort().forEach(key => {
    //     chartData.push([new Date(key).getTime(), dailyCount[key]]);
    // });


    /** Plotting format of time-bar. */
    const timebar = Highcharts.stockChart('timebar-container', {
      chart: {
        height: 150,
        backgroundColor: undefined,
        zoomType: 'x',
        events: {
          /**
           *  Tow things to check on a click event:
           *  1. Plot band: transparent orange box drew on time-bar.
           *  2. Ticks (x-axis label): color the x-axis if it is labeled.
           */
          click: event => {
            // @ts-ignore
            const [leftBandStart, bandCenter, rightBandEnd, tick] = this.closestTickNearClick(event.xAxis[0]);
            const dateSelectedInYMD = new Date(bandCenter).toISOString().substring(0, 10);
            if (!this.hasPlotBand) {
              timebar.xAxis[0].addPlotBand({
                from: leftBandStart,
                to: rightBandEnd,
                color: 'rgba(216,128,64,0.25)',
                id: 'plotBand',
              });
              if (tick !== undefined) {
                tick.label.css({
                  color: '#ffffff'
                });
              }
              this.currentTick = tick;
              this.hasPlotBand = true;
              this.timeService.setCurrentDate(dateSelectedInYMD);
            } else if (dateSelectedInYMD !== this.timeService.getCurrentDate()) {
              timebar.xAxis[0].removePlotBand('plotBand');
              timebar.xAxis[0].addPlotBand({
                from: leftBandStart,
                to: rightBandEnd,
                color: 'rgba(216,128,64,0.25)',
                id: 'plotBand'
              });
              if (this.currentTick !== undefined && this.currentTick.hasOwnProperty('label')) {
                this.currentTick.label.css({
                  color: '#666666'
                });
              }
              if (tick !== undefined) {
                tick.label.css({
                  color: '#ffffff'
                });
              }
              this.currentTick = tick;
              this.timeService.setCurrentDate(dateSelectedInYMD);
            } else {
              timebar.xAxis[0].removePlotBand('plotBand');
              if (this.currentTick !== undefined && this.currentTick.hasOwnProperty('label')) {
                this.currentTick.label.css({
                  color: '#666666'
                });
              }
              this.currentTick = undefined;
              this.hasPlotBand = false;
              this.timeService.setCurrentDate(undefined);
            }
          },
        }
      },
      navigator: {
        margin: 2,
        height: 30,
      },
      title: {
        text: '',
      },
      bar: [{
        type: 'line',
        data: chartData,
        color: '#e25822',
        name: '<span style=\'color:#e25822\'>Wildfire Tweet</span>',
      }],
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255,255,255,0)',
        padding: 0,
        hideDelay: 0,
        style: {
          color: '#ffffff',
        }
      },
      rangeSelector: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        range: 6 * 30 * 24 * 3600 * 1000, // six months
        events: {
          /**
           *  This event allow both selections on time-bar and navigator,
           *  updating information of date.
           */
          setExtremes: (event) => {
            console.log(event.min);
            console.log(event.max);
            this.timeService.setRangeDate(event.min, event.max);

            $('#report').html('Date Range => ' +
              'Start: ' + Highcharts.dateFormat('%Y-%m-%d', event.min) +
              ', End: ' + Highcharts.dateFormat('%Y-%m-%d', event.max));
            $(window).trigger('timeRangeChange');
          }
        }
      },
      scrollbar: {
        height: 0,
      },
    });
  }

  /**
   *  Summary: Generate information needed for click event.
   *
   *  Description: Receive a event axis with click value to measure the distance on time bar.
   *
   *  @param eventAxis Click event fire information of axis.
   *
   *  @return [leftBandStart, bandCenter, rightBandEnd, tick] which will be used in
   *  time bar click event.
   */
  closestTickNearClick(eventAxis): [number, number, number, any] {

    const halfUnitDistance = 43200000;
    const xAxis = eventAxis.axis;
    const dateClickedInMs = eventAxis.value;
    let distanceToTheLeft;
    let distanceToTheRight;
    let minValue;
    let minKey;
    if (xAxis.ordinalPositions === undefined) {
      /** Ticks evenly distributed with unit distance 43200000*2. */
      minValue = dateClickedInMs - dateClickedInMs % halfUnitDistance;
      minValue += minValue % (halfUnitDistance * 2);
      distanceToTheLeft = halfUnitDistance;
      distanceToTheRight = halfUnitDistance;
    } else {
      /** Ticks distributed with different distance. */
      xAxis.ordinalPositions.forEach((value, index) => {
        if (minValue === undefined || Math.abs(dateClickedInMs - value) < Math.abs(dateClickedInMs - minValue)) {
          minValue = value;
          minKey = index;
        }
      });
      if (minKey === 0 || minKey === xAxis.ordinalPositions.length - 1) {
        /** Case when click at the beginning or the end of the range. */
        distanceToTheLeft = 0;
        distanceToTheRight = 0;
      } else {
        distanceToTheLeft = (xAxis.ordinalPositions[minKey] - xAxis.ordinalPositions[minKey - 1]) / 2;
        distanceToTheRight = (xAxis.ordinalPositions[minKey + 1] - xAxis.ordinalPositions[minKey]) / 2;
      }
    }
    console.log(minValue - distanceToTheLeft);
    console.log(minValue);
    console.log(distanceToTheRight + minValue);
    // this.timeService.setRangeDate(minValue - distanceToTheLeft, distanceToTheRight + minValue);
    // $('#report').html('Date Range => ' +
    //     'Start: ' + Highcharts.dateFormat('%Y-%m-%d', minValue - distanceToTheLeft) +
    //     ', End: ' + Highcharts.dateFormat('%Y-%m-%d', distanceToTheRight + minValue));
    // $(window).trigger('timeRangeChange');
    this.timeService.setRangeDate(minValue, (2 * distanceToTheRight) + minValue);
    // this.timeService.getTweetByDate(minValue, (2 * distanceToTheRight) + minValue);
    this.start = Highcharts.dateFormat('%Y-%m-%d', minValue);
    this.end = Highcharts.dateFormat('%Y-%m-%d', 2 * distanceToTheRight + minValue);

    $(window).trigger('timeRangeChange');
    return [minValue - distanceToTheLeft, minValue, distanceToTheRight + minValue, xAxis.ticks[minValue]];
  }
}
