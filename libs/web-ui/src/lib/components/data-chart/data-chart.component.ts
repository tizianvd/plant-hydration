import { Component, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { MqttData } from '@plant-hydration/lib-api'
import { Observable, Subscription, tap } from 'rxjs';

export interface DataChartData {
  data: MqttData[];
  timeUnit: string;
  unit: string;
}

@Component({
  selector: 'lib-component-data-chart',
  templateUrl: './data-chart.component.html',
  styleUrl: './data-chart.component.scss',
})
export class DataChartComponent implements AfterViewInit, OnDestroy  {
  chart?: Chart;

  @Input() 
  dataLabel = "";

  @Input()
  displayLabel = false;

  @Input() scaleMin = -10;
  @Input() scaleMax = 100;

  bigValue = 0;
  bigValueUnit = "";

  protected sub?: Subscription;
  @Input() 
  public set data(value: Observable<DataChartData>){
    this.sub?.unsubscribe();
    this.sub = value.pipe(tap((data) => {

      if (data.timeUnit === 'live') {
        this.bigValue = data.data[data.data.length - 1].value;
      }
      else {
        this.bigValue = Math.round(data.data.reduce((acc, d) => acc + d.value, 0) / data.data.length * 10) / 10;
      }

      this.bigValueUnit = data.unit;

      if(this.chart?.data){
        this.chart.data.datasets[0].data = data.data.map(d => d.value) as number[];
        this.chart.data.labels = data.data.map(d =>  this.getFormattedTime(d.timestamp, data.timeUnit)) as string[];
        this.chart.update();
      }
    })).subscribe();
  }
  

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getFormattedTime(timestamp: number, unit: string): string {
    switch(unit){
      case "live":
        return new Date(timestamp).getSeconds().toString();
      case "quarter":
        return new Date(timestamp).getMinutes().toString();
    }

    return "";
  }

  createChart(){
  
    this.chart = new Chart(this.dataLabel + '-chart', {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: this.dataLabel,
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'myScale',
            xAxisID: 'time',
          }],
      }, 
      options: {
        plugins: {
          legend: {
            display: this.displayLabel
          },
        },
        scales: {
          myScale: {
            position: 'left', 
            suggestedMin: this.scaleMin,
            suggestedMax: this.scaleMax,
        },
        time: {
          display: true,
          alignToPixels: true,
        },
        
        },
      responsive: true
      }
    });
  }
}
