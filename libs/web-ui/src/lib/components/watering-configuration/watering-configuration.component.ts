import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription, Observable, interval, switchMap, tap, startWith} from 'rxjs';
import { ConfigurationService } from '../../services/configuration.service';
@Component({
  selector: 'lib-component-watering-configuration',
  templateUrl: './watering-configuration.component.html',
  styleUrl: './watering-configuration.component.scss',
})
export class WateringConfigurationComponent implements OnInit, OnDestroy  {
  form: FormGroup;
  sub?: Subscription;

  referenceValues$: Observable<number[][]>;

  intervalNames = ["Tage", "Stunden", "Minuten", "Sekunden"];

  constructor(private fb: FormBuilder, private configurationsService: ConfigurationService) { 
    this.form = this.fb.group({
      interval: new FormControl(""),
      intervalUnit: new FormControl(""),
      temperatureThreshold: new FormControl(""),
      temperatureCorrecture: new FormControl(""),
    });

    this.referenceValues$ = interval(1000).pipe(
      startWith(0),
      switchMap(() => this.configurationsService.getReferenceValues()),
      tap((values) => {
        this.form.patchValue({
          interval: values[0][0],
          intervalUnit: values[0][1],
          temperatureThreshold: values[3][0],
          temperatureCorrecture: values[4][0],
        });
      })
    );  

  }

  ngOnInit(): void {
    true
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
