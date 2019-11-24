import { Component, OnInit, ViewChildren, QueryList, ViewChild, ChangeDetectorRef, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import {
	GridsterComponent,
	IGridsterOptions,
	IGridsterDraggableOptions
  } from "angular2gridster";

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


// import 'jquery-ui/ui/widgets/draggable';
// import 'jquery-ui/ui/widgets/droppable';
// import 'jquery-ui/ui/widgets/resizable';

@Component({
	selector: 'app-public-dashboard',
	templateUrl: './public-dashboard.component.html',
	styleUrls: ['./public-dashboard.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PublicDashboardComponent implements OnInit {


	static X_PROPERTY_MAP: any = {
		sm: "xSm",
		md: "xMd",
		lg: "xLg",
		xl: "xXl"
	  };
	
	  static Y_PROPERTY_MAP: any = {
		sm: "ySm",
		md: "yMd",
		lg: "yLg",
		xl: "yXl"
	  };
	
	  static W_PROPERTY_MAP: any = {
		sm: "wSm",
		md: "wMd",
		lg: "wLg",
		xl: "wXl"
	  };
	
	  static H_PROPERTY_MAP: any = {
		sm: "hSm",
		md: "hMd",
		lg: "hLg",
		xl: "hXl"
	  };
	  @ViewChild(GridsterComponent, {static:true}) gridster: GridsterComponent;
	  itemOptions = {
		maxWidth: 3,
		maxHeight: 4
	  };
	  gridsterOptions: IGridsterOptions = {
		// core configuration is default one - for smallest view. It has hidden minWidth: 0.
		lanes: 2, // amount of lanes (cells) in the grid
		direction: "vertical", // floating top - vertical, left - horizontal
		floating: true,
		dragAndDrop: true, // enable/disable drag and drop for all items in grid
		resizable: true, // enable/disable resizing by drag and drop for all items in grid
		resizeHandles: {
		  s: true,
		  e: true,
		  se: true
		},
		widthHeightRatio: 1, // proportion between item width and height
		lines: {
		  visible: true,
		  color: "#afafaf",
		  width: 2
		},
		shrink: true,
		useCSSTransforms: true,
		responsiveView: true, // turn on adopting items sizes on window resize and enable responsiveOptions
		responsiveDebounce: 500, // window resize debounce time
		responsiveSizes: true,
		// List of different gridster configurations for different breakpoints.
		// Each breakpoint is defined by name stored in "breakpoint" property. There is fixed set of breakpoints
		// available to use with default minWidth assign to each.
		// - sm: 576 - Small devices
		// - md: 768 - Medium devices
		// - lg: 992 - Large devices
		// - xl: 1200 - Extra large
		// MinWidth for each breakpoint can be overwritten like it's visible below.
		// ResponsiveOptions can overwrite default configuration with any option available.
		responsiveOptions: [
		  {
			breakpoint: "sm",
			// minWidth: 480,
			lanes: 3
		  },
		  {
			breakpoint: "md",
			minWidth: 768,
			lanes: 4
		  },
		  {
			breakpoint: "lg",
			minWidth: 1250,
			lanes: 6
		  },
		  {
			breakpoint: "xl",
			minWidth: 1800,
			lanes: 8
		  }
		]
	  };
	  gridsterDraggableOptions: IGridsterDraggableOptions = {
		handlerClass: "panel-heading"
	  };
	  title = "Angular2Gridster";
	  widgetsCopy = [];
	  widgets: Array<any> = [];

	// tslint:disable-next-line: max-line-length
	charts: any;
	registerForm: FormGroup;
	passwordMatch;
	dashboardName;
	loginForm: FormGroup;
	isLoading: boolean;
	widgetIds;
	constructor(
		private cd: ChangeDetectorRef,
		public globals: Globals,
		private fb: FormBuilder,
		public authService: AuthService,
		public widgetService: DatasourceWidgetService,
		public datasourceDashboardService: DatasourceDashboardService,
		private translate: TranslateService,
	) {
	 }

	ngOnInit() {
		

	
	

	
		this.charts = [];
		this.dashboardName = '';
		// this.area.cellHeight = dashboardGridOptions.rowHeight - dashboardGridOptions.margins + 'px';
		// this.area.verticalMargin = dashboardGridOptions.margins;
		// this.area.auto = false;
		// this.area.rtl = 'auto';
		// this.area.disableOneColumnMode = true;

		// const gsEL: any = this.gridStackMain;
		// this.gridStackEl = gsEL.el.nativeElement;
		this.fetchDataFromLocalStorage();

		this.initializeRegistrationForm();
		this.initializeLoginForm();

		console.log("chart" , this.charts);

		this.setWidgets();
		this.widgetsCopy = this.widgets.map(widget => ({ ...widget }));


	}

	changeTab(vl) {
		$('a[href="#' + vl + '"]').tab('show');
	}

	setWidgets()
	{
		this.charts.forEach(element => {
			const widget = {
				x: 0,
				y: 0,
				w: 1,
				h: 2,
				wSm: 1,
				hSm: 1,
				wMd: 1,
				hMd: 2,
				wLg: 1,
				hLg: 1,
				wXl: 2,
				hXl: 2,
				dragAndDrop: true,
				resizable: true,
				title: element.data.name,
				content: element
			  };
			this.widgets.push(widget);
		});
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


	ngAfterViewInit() {
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
			this.isLoading = false;
		}, (err) => {
			const msg = 'There was an error creating record'
		});
	}

	saveCharts() {
		// The array is deep copied to the uploadCharts
		const uploadCharts = $.extend(true, [], this.charts);
		console.log('old charts: ', this.charts);

		uploadCharts.map(chart => {
			chart.name = chart.layout.hasOwnProperty('title') ? chart.layout.title.text : 'CHART_NAME';
			chart.layout['title'] = chart.name;
			chart.layout = JSON.stringify(chart.layout);
			chart.config = JSON.stringify(chart.config);
			chart.data = JSON.stringify(chart.data);
			delete chart['gridstack'];
			delete chart['id'];
			delete chart['filteredData'];
			chart.user = this.authService.getLoggedInUserId();
			return chart;
		});

		console.log('new charts: ', uploadCharts);
		this.widgetService.addBulkWidgets(uploadCharts).subscribe(res => {
			console.log(res);
			this.widgetIds = res.ids;
			if (!this.dashboardName.length) {
				this.getDashboardName();
			} else {
				this.saveDashboard();
			}
		}, err => {
			console.log('err: ', err);
		});
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


	/////////////////////Gridster//////////////////////////////

	onReflow(event) {
		console.log("onReflow", event);
	  }
	
	  removeLine(gridster: GridsterComponent) {
		gridster.setOption("lanes", --this.gridsterOptions.lanes).reload();
	  }
	
	  getTitle() {
		return this.title;
	  }
	
	  addLine(gridster: GridsterComponent) {
		gridster.setOption("lanes", ++this.gridsterOptions.lanes).reload();
	  }
	
	  setWidth(widget: any, size: number, e: MouseEvent, gridster) {
		e.stopPropagation();
		e.preventDefault();
		if (size < 1) {
		  size = 1;
		}
		widget.w = size;
	
		gridster.reload();
	
		return false;
	  }
	
	  setHeight(widget: any, size: number, e: MouseEvent, gridster) {
		e.stopPropagation();
		e.preventDefault();
		if (size < 1) {
		  size = 1;
		}
		widget.h = size;
	
		gridster.reload();
	
		return false;
	  }
	
	  optionsChange(options: IGridsterOptions) {
		this.gridsterOptions = options;
		console.log("options change:", options);
	  }
	
	  swap() {
		this.widgets[0].x = 3;
		this.widgets[3].x = 0;
	  }
	
	  addWidgetFromDrag(gridster: GridsterComponent, event: any) {
		const item = event.item;
		const breakpoint = gridster.options.breakpoint;
		const widget = {
		  dragAndDrop: true,
		  resizable: true,
		  title: "New widget"
		};
	
		widget[PublicDashboardComponent.W_PROPERTY_MAP[breakpoint] || "w"] = item.w;
		widget[PublicDashboardComponent.H_PROPERTY_MAP[breakpoint] || "h"] = item.h;
		widget[PublicDashboardComponent.X_PROPERTY_MAP[breakpoint] || "x"] = item.x;
		widget[PublicDashboardComponent.Y_PROPERTY_MAP[breakpoint] || "y"] = item.y;
	
		for (const rwdProp of [
		  "wSm",
		  "hSm",
		  "wMd",
		  "hMd",
		  "wLg",
		  "hLg",
		  "wXl",
		  "hXl"
		]) {
		  if (event.item.itemPrototype.hasOwnProperty(rwdProp)) {
			widget[rwdProp] = event.item.itemPrototype[rwdProp];
		  }
		}
	
		this.widgets.push(widget);
	
		console.log("add widget from drag to:", gridster);
	  }
	
	  over(event) {
		const size = event.item.calculateSize(event.gridster);
	
		event.item.itemPrototype.$element.querySelector(
		  ".gridster-item-inner"
		).style.width =
		  size.width + "px";
		event.item.itemPrototype.$element.querySelector(
		  ".gridster-item-inner"
		).style.height =
		  size.height + "px";
		event.item.itemPrototype.$element.classList.add("is-over");
	  }
	
	  out(event) {
		event.item.itemPrototype.$element.querySelector(
		  ".gridster-item-inner"
		).style.width =
		  "";
		event.item.itemPrototype.$element.querySelector(
		  ".gridster-item-inner"
		).style.height =
		  "";
		event.item.itemPrototype.$element.classList.remove("is-over");
	  }
	
	  addWidgetWithoutData() {
		this.widgets.push({
		  title: "Basic form inputs X",
		  dragAndDrop: true,
		  resizable: true,
		  content:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et " +
			"dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea " +
			"commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla " +
			"pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est " +
			"laborum."
		});
	  }
	
	  addWidget(gridster: GridsterComponent) {
		this.widgets.push({
		  x: 4,
		  y: 0,
		  w: 1,
		  h: 1,
		  dragAndDrop: true,
		  resizable: true,
		  title: "Basic form inputs 5",
		  content:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et " +
			"dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea " +
			"commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla " +
			"pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est " +
			"laborum."
		});
		console.log("widget push", this.widgets[this.widgets.length - 1]);
	  }
	
	  remove($event, index: number, gridster: GridsterComponent) {
		$event.preventDefault();
		this.widgets.splice(index, 1);
		console.log("widget remove", index);
	  }
	
	  removeAllWidgets() {
		this.widgets = [];
	  }
	
	  itemChange($event: any, gridster) {
		console.log("item change", $event);
	  }
	
	  resetWidgets() {
		this.widgets = this.widgetsCopy.map(widget => ({ ...widget }));
	  }

}
