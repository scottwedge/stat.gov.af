import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'
import { Globals } from '../core/_helpers/globals';
import { CookieService } from 'ngx-cookie-service';
import { DatatablesService } from '../services/datatables.service';
import { Router } from '@angular/router';


declare var $: any;

@Component({
	selector: 'home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	private listTitles: any[];
	location: Location;
	private nativeElement: Node;
	private toggleButton;
	private sidebarVisible: boolean;
	languageBadge;
	selectEnvironment;
	totalDashboards = 0;
	lang;
	owl;

	dashboards;
	bgColors = [
		'#83D191',
		'#FF8C8C',
		'#EDFF7C',
		'#FF5E93',
		'#77C2FF',
		'#FF6459',
		'#FF77C2',
		'#FFB791',
		'#30FFC7',
		'#DDFFA8'
	]

	availLangs = [
		{ name: 'English', value: 'en', dir: 'ltr' },
		{ name: 'پښتو', value: 'ps', dir: 'rtl' },
		{ name: 'دری', value: 'dr', dir: 'rtl' }
	];

	features = [
		{
			icon: 'dashboard.svg',
			title: 'first_feature_title',
			details: 'first_feature_description'
		}, {
			icon: 'bar-chart.svg',
			title: 'second_feature_title',
			details: 'second_feature_description'
		}, {
			icon: 'database.svg',
			title: 'third_feature_title',
			details: 'third_feature_description'
		}, {
			icon: 'translate.svg',
			title: 'fourth_feature_title',
			details: 'fourth_feature_description'
		}, {
			icon: 'share.svg',
			title: 'fifth_feature_title',
			details: 'fifth_feature_description'
		}, {
			icon: 'time-place.svg',
			title: 'sixth_feature_title',
			details: 'sixth_feature_description'
		}
	];

	currentDate = new Date();
	constructor(private translate: TranslateService,
		public globals: Globals,
		private cookieService: CookieService,
		private datatablesService: DatatablesService,
		private router: Router,
		private cdref: ChangeDetectorRef
	) { }


	ngOnInit() {
		if (this.cookieService.get('lang')) {
			this.lang = this.cookieService.get('lang');
		} else {
			this.lang = 'en';
		}
	}

	gotoDashboard(slug) {
		console.log('slug:', slug);
		this.router.navigate([`/dashboard/${slug}`]);
	}



	getCurrentEnvironment() {
		if (this.globals.principal) {
			for (let envObj of this.globals.principal.environments) {
				if (envObj['slug'] == this.globals.principal.selectedEnv) {
					return envObj;
				}
			}
		}

	}

	getColor() {
		const index = (Math.random() * 9).toFixed();
		console.log('Index', index);
		return this.bgColors[index];

	}


	ngAfterViewInit() {
		this.globals.isDashboardListUpdated.subscribe((value) => {
			console.log(value);
			if (true === value) {
				setTimeout(() => {
					this.renderCarousel();
				}, 2000);
			} else {
				// do some other stuff
			}
		});
	}

	renderCarousel() {
		if (this.globals.dashboardList && this.globals.dashboardList.length > 0) {
			this.totalDashboards = this.globals.dashboardList.length;
		} else {
			this.totalDashboards = 0;
		}

		console.log('Dashboard List: ', this.globals.dashboardList);

		this.dashboards = [];

		this.globals.dashboardList.map(gd => {
			const t = {
				name: JSON.parse(gd.name),
				slug: gd.slug,
				tags: gd.tags.map(tg => {
					return JSON.parse(tg)
				}),
				bgColor: this.getColor()
			}

			this.dashboards.push(t);
		});

		console.log('dasboards: ', this.dashboards);

		const that = this;

		// Initialize carousel
		$(document).ready(function () {

			that.owl = $('.owl-carousel').owlCarousel({
				loop: true,
				margin: 10,
				nav: true,
				// tslint:disable-next-line: max-line-length
				navText: ['<div class="my-owl-nav"> <span class="fa fa-arrow-left"></span></div>', '<div class="my-owl-nav"> <span class="fa fa-arrow-right"></span></div>'],
				dots: true,
				autoplay: true,
				autoplaySpeed: 800,
				pagination: true,
				responsive: {
					0: {
						items: 1
					},
					600: {
						items: 3
					},
					1000: {
						items: 5
					}
				}
			});
		});

		this.selectEnvironment = this.getCurrentEnvironment();

		this.translate.onLangChange.subscribe((event) => {
			this.lang = event.lang;
			this.cdref.detectChanges();
			console.log('In home', this.lang);

			// In order to avoid copy by reference;
			this.owl.trigger('refresh.owl.carousel');
		});

	}


}



