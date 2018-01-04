import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {  MatAutocompleteModule, MatTabsModule, MatStepperModule } from '@angular/material';
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { AppComponent } from './app.component';
import exporting from 'highcharts/modules/exporting.src.js';
import * as highstock from 'highcharts/highstock';

export function highstockFactory() {
  exporting(highstock);
  return highstock;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatStepperModule,
    ChartModule,
  ],
  providers: [{
    provide: HighchartsStatic,
    useFactory: highstockFactory
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
