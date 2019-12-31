import { Routes } from '@angular/router';

import { AllWidgetsComponent } from './all-widgets.component';

export const MyWidgetsRoutes: Routes = [
	// {
	//     path: '/edit',
	//     component: EditDashboardComponent,
	// },
	{
		path: '',
		component: AllWidgetsComponent,
		pathMatch: 'full'
	}
];
