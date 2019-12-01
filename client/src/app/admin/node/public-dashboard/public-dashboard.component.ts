import { Component, OnInit, ViewChildren, QueryList, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';

declare var $: any;
import { GridStackItem, GridStackOptions, GridStackItemComponent, GridStackComponent } from 'ng4-gridstack'
import { Dashboard, dashboardGridOptions } from '../../../models/dashboard';
import { Globals } from 'app/core';
import { AuthService } from 'app/services/auth.service';
import { DatasourceWidgetService } from 'app/services/datasource.widget.service';
import { DatasourceDashboard } from 'app/models/datasource.dashboard';
import { DatasourceDashboardService } from 'app/services/datasource.dashboard.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';


@Component({
	selector: 'app-public-dashboard',
	templateUrl: './public-dashboard.component.html',
	styleUrls: ['./public-dashboard.component.scss']
})
export class PublicDashboardComponent implements OnInit {

	options;
	gridStackEl;
	charts: any;
	registerForm: FormGroup;
	passwordMatch;
	dashboardName;
	loginForm: FormGroup;
	isLoading: boolean;
	showGrid = false;
	widgetIds;
	dashboardId: any;
	constructor(
		private cd: ChangeDetectorRef,
		public globals: Globals,
		private fb: FormBuilder,
		public authService: AuthService,
		public widgetService: DatasourceWidgetService,
		public datasourceDashboardService: DatasourceDashboardService,
		private translate: TranslateService,
		private router: Router
	) { }

	ngOnInit() {


		console.log(this.charts);
		this.charts = [];
		this.dashboardName = '';

		this.fetchDataFromLocalStorage();


		this.initializeRegistrationForm();
		this.initializeLoginForm();
		console.log(this.charts);


	}


	changeTab(vl) {
		$('a[href="#' + vl + '"]').tab('show');
	}


	checkPasswords(group: FormGroup) { // here we have the 'passwords' group
		const pass = group.controls.password.value;
		const confirmPass = group.controls.passwordConf.value;

		return pass === confirmPass ? null : { notSame: true }
	}

	checkPassword(pass, confPass) {
		if (pass !== confPass) {
			this.passwordMatch = false;
		} else {
			this.passwordMatch = true;
		}
	}

	initializeRegistrationForm() {
		this.registerForm = this.fb.group({
			fullName: ['', Validators.required],
			username: ['', Validators.required],
			mobileNumber: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			password: ['', Validators.required],
			passwordConf: ['', Validators.required]
		}, { validators: this.checkPasswords });

	}

	initializeLoginForm() {
		this.loginForm = this.fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
		});

	}

	fetchDataFromLocalStorage() {

		if (window.localStorage) {
			if (localStorage.getItem('charts')) {
				this.charts = JSON.parse(localStorage.getItem('charts'));
			}
		}
	}

	checkUserLoggedIn() {
		if (this.authService.isLoggedIn()) {
			console.log('Saving Visulaziation');
			this.saveCharts();
		} else {
			this.showSignUpPopUp();
		}
	}

	getDashboardName() {
		$('#dashboarModal').modal();
	}


	login() {
		console.log('Login form: ', this.loginForm);
		const newRecord = {
			'username': this.loginForm.get('username').value,
			'password': this.loginForm.get('password').value
		}
		this.authService.login(newRecord).subscribe((res: any) => {
			console.log('login res: ', res);
			// Hide the modal back
			$('#signupModal').modal('hide');
			this.loginForm.reset({});
			this.registerForm.reset({});

			this.authService.saveToken(res.token);
			this.authService.setLoggedInUserId(res.user_id);

			// Save the chart
			this.saveCharts();

		}, err => {
			console.log('Error: ', err);

		});
	}

	register() {
		console.log('Register Form: ', this.registerForm);
		const formJson = {
			'fullName': this.registerForm.get('fullName').value,
			'username': this.registerForm.get('username').value,
			'mobileNumber': this.registerForm.get('mobileNumber').value,
			'email': this.registerForm.get('email').value,
			'password': this.registerForm.get('password').value
		};

		this.authService.createUser(formJson).subscribe(res => {
			console.log('registeration success: ', res);
			// Hide the modal back
			$('#signupModal').modal('hide');
			this.loginForm.reset({});
			this.registerForm.reset({});

			// Save the chart
			this.saveCharts();

		}, err => {
			console.log('error: ', err);

		});
	}


	showSignUpPopUp() {
		$('#signupModal').modal();
		$('#home').tab('show');
	}

	saveNewGridAttributes(elem) {

		const chartId = $(elem).attr('id');
		console.log('charId: ', chartId);
		this.charts.map(chart => {
			if (chart.id === Number(chartId)) {
				console.log('this id matches', chartId);
				console.log($(elem).attr('data-gs-x'));
				console.log('Element is : ', elem);

				chart.gridstack.col = Number($(elem).attr('data-gs-x'));
				chart.gridstack.row = Number($(elem).attr('data-gs-y'));
				chart.gridstack.sizeX = Number($(elem).attr('data-gs-width'));
				chart.gridstack.sizeY = $(elem).attr('data-gs-height');
				chart.saved = false;
			}

			return chart;
		});

		console.log(this.charts);

		localStorage.setItem('charts', JSON.stringify(this.charts));
	}

	initGridStack() {
		$('.grid-stack').gridstack({

			// widget class
			itemClass: 'grid-stack-item',

			// class for placeholder
			placeholderClass: 'grid-stack-placeholder',

			// text for placeholder
			placeholderText: '',

			// draggable handle selector
			// handle: '.grid-stack-item-content',

			// class for handle
			handleClass: null,

			// one cell height
			cellHeight: 60,

			// vertical gap size
			verticalMargin: 20,

			// unit
			verticalMarginUnit: 'px',
			cellHeightUnit: 'px',

			// if false it tells to do not initialize existing items
			auto: true,

			// minimal width.
			minWidth: 768,

			// enable floating widgets
			float: true,

			// makes grid static
			staticGrid: false,

			// if true the resizing handles are shown even the user is not hovering over the widget
			alwaysShowResizeHandle: true,

			// allows to owerride jQuery UI draggable options
			draggable: { handle: '.grid-stack-item-content', scroll: true, appendTo: 'body' },

			// allows to owerride jQuery UI resizable options
			resizable: {
				handles: 'e, se, s, sw, w'
			},

			always_show_resize_handle: true,
			placeholder_class: 'grid-stack-placeholder',
			acceptWidgets: '.grid-stack-item'
		});
	}


	ngAfterViewInit() {

		const that = this;

		$('.grid-stack').on('gsresizestop', function (event, elem) {
			console.log('resize');
			that.saveNewGridAttributes(elem);
		});

		$('.grid-stack').on('dragstop', function (event, ui) {
			console.log('drag');
			// Wait until the the stat of the element has changed
			setTimeout(() => {
				that.saveNewGridAttributes(event.target);
			}, 10);
		});

		// this.initGridStack()
		this.initGridStack();




	}

	getLangDirection() {
		if (localStorage.getItem('lang')) {
			if (localStorage.getItem('lang') != 'en') {
				return 'rtl'
			}
		}
		return 'ltr';
	}

	refresh() {
		this.charts = [];
		this.fetchDataFromLocalStorage();
	}

	saveDashboard() {

		const obj = new DatasourceDashboard();
		obj.name = this.dashboardName;
		obj.user = this.authService.getLoggedInUserId();
		obj.layout = null;
		obj.widgets = this.widgetIds;



		// this.newRecord.permissions = JSON.stringify(permissions);

		this.isLoading = true;
		this.datasourceDashboardService.create(obj).subscribe((response) => {
			console.log('server response: ', response);
			const msg = 'Record successfully created';
			this.dashboardId = response._id;
			Swal({
				title: this.translate.instant('WELL_DONE'),
				text: this.translate.instant('WIDGET_SUBMITTED'),
				buttonsStyling: false,
				confirmButtonClass: 'btn btn-fill btn-success',
				type: 'success'
			}).catch(Swal.noop)
			this.isLoading = false;
			this.router.navigate(['custom/my-dashboards/edit'], { state: { recordId: this.dashboardId } });
			localStorage.removeItem('charts');
		}, (err) => {
			const msg = 'There was an error creating record';
			this.showNotification('top', 'center', msg, 'danger', 'pe-7s-attention');
		});
	}

	saveCharts() {
		// The array is deep copied to the uploadCharts
		let uploadCharts = $.extend(true, [], this.charts);
		console.log('old charts: ', this.charts);

		uploadCharts = uploadCharts.filter(chart => !chart.saved);

		uploadCharts.map(chart => {
			chart.name = chart.layout.hasOwnProperty('title') ? chart.layout.title.text : 'CHART_NAME';
			chart.layout['title'] = chart.name;
			chart.layout = JSON.stringify(chart.layout);
			chart.config = JSON.stringify(chart.config);
			chart.data = JSON.stringify(chart.data);
			chart.gridstack = JSON.stringify(chart.gridstack);
			delete chart['id'];
			delete chart['saved'];
			delete chart['filteredData'];
			chart.user = this.authService.getLoggedInUserId();
			return chart;
		});

		console.log('new charts: ', uploadCharts);

		if (uploadCharts.length) {

			this.widgetService.addBulkWidgets(uploadCharts).subscribe(res => {
				console.log(res);
				this.widgetIds = res.ids;

				this.charts.map(chart => {
					chart.saved = true;
					return chart;
				});

				this.getDashboardName();

			}, err => {
				console.log('err: ', err);
			});
		} else {
			const msg = 'Charts are already saved';
			this.showNotification('top', 'center', msg, 'success', 'pe-7s-check');
		}


	}

	resetCharts() {
		Swal({
			title: this.translate.instant('RESET-ALL-ALERT'),
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: this.translate.instant('CONFIRM-BUTTONT-TEXT'),
			cancelButtonText: this.translate.instant('CANCEL'),
			useRejections: true
		}).then(
			result => {
				this.charts = [];
				if (localStorage.getItem('charts')) {
					localStorage.removeItem('charts');
				}
			},
			dismiss => {
				console.log(`dialog was dismissed by ${dismiss}`);
			});
	}

	removeChart(chartId) {
		this.charts = JSON.parse(localStorage.getItem('charts'));
		this.charts.forEach((el, i) => {
			if (el.id === chartId) {
				this.charts.splice(i, 1);
			}
		});
		if (this.charts.length === 0) {
			localStorage.setItem('chartId', JSON.stringify(1));
		}
		localStorage.setItem('charts', JSON.stringify(this.charts));
	}

	showNotification(from, align, msg, type, icon) {
		$.notify({
			icon: icon,
			message: msg

		}, {
			type: type,
			timer: 4000,
			placement: {
				from: from,
				align: align
			}
		});
	}



}
