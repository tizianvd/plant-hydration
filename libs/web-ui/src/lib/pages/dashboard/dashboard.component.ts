import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin, map, of, share, startWith, switchMap } from 'rxjs';
import { ConfigurationService } from '../../services/configuration.service';
import { ConfigurationsDictionary } from '@plant-hydration/lib-api';
import { SseService } from '../../services/sse.service';
import { DataService } from '../../services/data.service';
import { DataChartData } from '../../components/data-chart/data-chart.component';

const SSE_DATA_STREAM = 'http://localhost:3000/api/mqtt/stream';

@Component({
  selector: 'lib-page-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  $configurations = this.configurationService.getConfigurations();

  private sharedStream$?: Observable<any>;
  protected $temperature?: Observable<DataChartData>;
  protected $humidity?: Observable<DataChartData>;
  protected $moisture?: Observable<DataChartData>;
  protected $lightLevel?: Observable<DataChartData>;

  dateRange = 'live';
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly sseService: SseService,
    private readonly dataService: DataService
  ) {}

  setConfiguration(
    configurations: ConfigurationsDictionary,
    group: string,
    key: string,
    value: string
  ) {
    configurations[group][key] = value;
    this.$configurations =
      this.configurationService.setConfigurations(configurations);
  }

  ngOnInit() {
    this.setDataSources();
  }

  setDataSources() {
    console.log('set data sources');
    this.sharedStream$ = this.dataService.getData().pipe(
      switchMap((data) => {
        if (this.dateRange !== 'live') {
          return forkJoin({
            temperatures: this.dataService.getHistory('Temperature', this.dateRange as any),
            humidities: this.dataService.getHistory('Humidity', this.dateRange as any),
            moisture: this.dataService.getHistory('Moisture', this.dateRange as any),
            lightLevel: this.dataService.getHistory('LightLevel', this.dateRange as any),
          });
        }
  
        return this.sseService
          .getEventStream(SSE_DATA_STREAM)
          .pipe(startWith(data));
      }),
      share()
    );

    this.$temperature = this.sharedStream$.pipe(map((data) => ({data: data.temperatures, timeUnit: this.dateRange, unit: '°C'})));
    this.$humidity = this.sharedStream$.pipe(map((data) => ({data: data.humidities, timeUnit: this.dateRange, unit: '%'})));
    this.$moisture = this.sharedStream$.pipe(map((data) => ({data: data.moisture, timeUnit: this.dateRange, unit: '%'})));
    this.$lightLevel = this.sharedStream$.pipe(map((data) => ({data: data.lightLevel, timeUnit: this.dateRange, unit: 'lx'})));
  }
}
