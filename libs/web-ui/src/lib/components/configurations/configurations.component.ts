import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, startWith, switchMap, tap, of , combineLatest} from 'rxjs';
import { ConfigurationService } from '../../services/configuration.service';
import { ConfigurationsDictionary } from '@plant-hydration/lib-api';
import { SseService } from '../../services/sse.service';

const SSE_URL = 'http://localhost:3000/api/configuration/stream';

@Component({
  selector: 'lib-component-configurations',
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.scss',
})
export class ConfigurationsComponent implements OnInit, OnDestroy  {
  form?: FormGroup;
  subs: Subscription[] = [];

  constructor(private fb: FormBuilder, private configurationsService: ConfigurationService, private readonly sseService: SseService, private cdr: ChangeDetectorRef) { 
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      lcd_display: this.fb.group({
        status: [''],
        backlight: [''],
        brightness: ['']
      }),
      pump: this.fb.group({
        status: [''],
      }),
    });


    this.subs.push(
      this.sseService
        .getEventStream(SSE_URL)
        .pipe(
          tap((configurations: ConfigurationsDictionary) => {
            this.form?.patchValue(configurations, { emitEvent: false });
          })
        )
        .subscribe()
    );

    this.subs.push(this.form.valueChanges.pipe(startWith(null)).subscribe((changes) => {
      if (changes) {
        this.subs.push(
          this.configurationsService.setConfigurations(changes).subscribe()
        );
      }}));
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
