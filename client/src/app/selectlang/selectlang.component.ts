import { Component, Input, OnInit, SimpleChange, SimpleChanges, ViewChild, ElementRef, OnChanges, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'
import { Globals } from '../core/_helpers/globals';
import { CookieService } from 'ngx-cookie-service';
import { DatatablesService } from '../services/datatables.service';
import { Router } from '@angular/router';


declare var $: any;

@Component({
	selector: 'selectlang',
	templateUrl: './selectlang.component.html',
	styleUrls: ['./selectlang.component.scss']
})
export class SelectLangComponent implements OnInit {
	private listTitles: any[];
	location: Location;
	private nativeElement: Node;
	private toggleButton;
	private sidebarVisible: boolean;
	languageBadge;
	selectEnvironment;

	availLangs = [
		{ name: 'English', value: 'en', dir: 'ltr' },
		{ name: 'پښتو', value: 'ps', dir: 'rtl' },
		{ name: 'دری', value: 'dr', dir: 'rtl' }
	];

	currentDate = new Date();
	constructor(private translate: TranslateService,
		public globals: Globals,
		private cookieService: CookieService,
		private datatablesService: DatatablesService,
		private router:Router) {
		console.log("Select Language work fine!");
	}

	year;
	lang = '';
	ngOnInit() {
		this.year = new Date().getFullYear();
	}

	 detectLanguage(el) {
		this.lang = $(el).closest('.lan').attr('id');
		// this.cookieService.set('lang', this.globals.lang);
		this.globals.lang = this.lang;
		this.cookieService.set('lang', this.globals.lang);
		this.translate.use(this.globals.lang);
		this.languageBadge = this.globals.lang;
		this.datatablesService.callServiceCmpMethod(this.globals.lang);
		this.router.navigate(["/home"]);
	 }




}



