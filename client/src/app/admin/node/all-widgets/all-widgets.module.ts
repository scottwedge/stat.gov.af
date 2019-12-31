import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GridStackModule } from 'ng4-gridstack';

import { MyWidgetsRoutes } from './all-widgets.routing';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { AllWidgetsComponent } from './all-widgets.component';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
PlotlyModule.plotlyjs = PlotlyJS;



@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		ReactiveFormsModule,
		JwBootstrapSwitchNg2Module,
		GridStackModule,
		PlotlyModule,
		FormsModule,
		RouterModule.forChild(MyWidgetsRoutes),
	],
	entryComponents: [
	],
	declarations: [
		AllWidgetsComponent
	]
})
export class AllWidgetsModule { }
