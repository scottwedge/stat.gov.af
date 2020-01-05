import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
	selector: 'app-layout',
	styles: [
		':host ::ng-deep .mat-drawer-content {padding: 0; display: block!important;} .mat-drawer-container {z-index: 1000}'
	],
	templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent {
	isNotLangPage = true;
	constructor(private route: Router) {
		console.log('URL: ', route.url);

		if (route.url.includes('lang')) {
			this.isNotLangPage = false;
		}
	}
}
