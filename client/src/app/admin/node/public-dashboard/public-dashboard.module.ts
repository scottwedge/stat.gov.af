import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// import { GridStackModule } from 'ng4-gridstack';

import { PublicDashboardRoutes } from './public-dashboard.routing';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { PublicDashboardComponent } from './public-dashboard.component';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';PlotlyModule.plotlyjs = PlotlyJS;

import { GridsterModule } from 'angular2gridster';


@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		ReactiveFormsModule,
		JwBootstrapSwitchNg2Module,
		PlotlyModule,
		FormsModule,
		GridsterModule.forRoot(), // .forRoot() is required since version v4+
		RouterModule.forChild(PublicDashboardRoutes),
	],
	entryComponents: [
	],
	declarations: [
		PublicDashboardComponent,
		// AddWidgetComponent,
	]
})
export class PublicDashboardModule { }
