import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DataChartComponent } from './components/data-chart/data-chart.component';
import { CoreComponent } from './pages/core/core.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';

import {MatGridListModule} from '@angular/material/grid-list';
import { ConfigurationsComponent } from './components/configurations/configurations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomSlideToggleComponent } from './components/custom-slide-toggle/custom-slide-toggle.component';
import { WateringConfigurationComponent } from './components/watering-configuration/watering-configuration.component';
import { StatsComponent } from './components/stats/stats.component';


@NgModule({
  imports: [
    CommonModule, 
    HttpClientModule, 
    FormsModule, 
    ReactiveFormsModule, 
    
    MatCardModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatSlideToggleModule, 
    MatSliderModule, 
    MatFormFieldModule,
    MatRadioModule,
    MatIconModule,
    MatSelectModule,
    MatGridListModule
  ],
  declarations: [DataChartComponent, ConfigurationsComponent, WateringConfigurationComponent, StatsComponent, CoreComponent, DashboardComponent, CustomSlideToggleComponent],
  exports:[CoreComponent],
  providers: []
})
export class WebUiModule {}
