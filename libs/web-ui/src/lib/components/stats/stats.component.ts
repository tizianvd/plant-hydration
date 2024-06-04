import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, startWith, map, switchMap, tap, withLatestFrom, of , combineLatest} from 'rxjs';
import { ConfigurationService } from '../../services/configuration.service';
import { ConfigurationsDictionary } from '@plant-hydration/lib-api';
import { SseService } from '../../services/sse.service';

@Component({
  selector: 'lib-component-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnInit, OnDestroy  {
  form?: FormGroup;
  sub?: Subscription;

  constructor(private fb: FormBuilder, private configurationsService: ConfigurationService, private readonly sseService: SseService) { 
  }

  ngOnInit(): void {
    this.form = this.fb.group({
    });

    // this.sseService.getEventStream().subscribe(data => {
    //   console.log("WORKING")
    //   console.log("SSE: ", data);
    // });


    // this.sub = combineLatest([this.sseService.getEventStream(), this.form.valueChanges.pipe(startWith(null))]).pipe(
    //   // withLatestFrom(this.form.valueChanges.pipe(startWith(null))),
    //   switchMap(([configurations, changes]) => {
    //     console.log(changes)
    //     if (changes) {
    //       return this.configurationsService.setConfigurations(changes);
    //     }
    //     return of(configurations.data);
    //   }),
    //   tap((configurations: ConfigurationsDictionary) => {
    //     this.form?.patchValue(configurations, { emitEvent: false });
    //   })).subscribe();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
