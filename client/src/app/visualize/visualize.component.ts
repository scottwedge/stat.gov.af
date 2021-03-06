import { Component, Input, OnInit, ViewChild, ElementRef, Inject, EventEmitter, Output, AfterViewInit } from '@angular/core';
import * as _ from 'lodash';
import { Globals } from './../core/_helpers';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { DatasourceWidgetService } from 'app/services/datasource.widget.service';
import { isNumber, isBoolean } from 'util';
import swal from 'sweetalert2';

declare var $: any;

const DEFAULT_OPTIONS = {
	globalSeriesType: 'column',
	sortX: true,
	legend: { enabled: true },
	yAxis: [{ type: 'linear' }, { type: 'linear', opposite: true }],
	xAxis: { type: '-', labels: { enabled: true } },
	error_y: { type: 'data', visible: true },
	series: { stacking: null, error_y: { type: 'data', visible: true } },
	seriesOptions: {},
	valuesOptions: {},
	columnMapping: {},

	// showDataLabels: false, // depends on chart type
	numberFormat: '0,0[.]00000',
	percentFormat: '0[.]00%',
	// dateTimeFormat: 'DD/MM/YYYY HH:mm', // will be set from clientConfig
	textFormat: '', // default: combination of {{ @@yPercent }} ({{ @@y }} ± {{ @@yError }})

	defaultColumns: 3,
	defaultRows: 8,
	minColumns: 1,
	minRows: 5,
};

@Component({
	selector: 'visualize',
	templateUrl: './visualize.component.html',
	styleUrls: ['./visualize.component.scss']
})
export class VisualizeComponent implements OnInit, AfterViewInit {
	@ViewChild('plotlyChartContainer', { static: true }) plotlyChartContainer: ElementRef;
	Plotly;
	plotlyElement;

	isLoading = true;
	localChartsArrayName;

	// Input forms
	registerForm: FormGroup;
	passwordMatch;
	loginForm: FormGroup;

	@Input() columns: any = [];
	@Input() rows: any = [];

	@Output()
	closeFlag = new EventEmitter<Object>();

	// plotlyConfig: any = Object.assign({}, DEFAULT_OPTIONS);
	plotlyConfig: any = { modeBarButtonsToRemove: ['sendDataToCloud'], showLink: false, displaylogo: false };
	layout: any = {
		autosize: true,
		xaxis: {
			showticklabels: true,
			autorange: true,
			// type: 'linear'
			automargin: true
		},
		yaxis: {
			showticklabels: true,
			autorange: true,
			// type: 'linear'
			automargin: true
		}
	};
	gridstack: any = {
		autoHeight: false,
		col: 0,
		maxSizeX: 12,
		maxSizeY: 1000,
		minSizeX: 1,
		minSizeY: 5,
		row: 0,
		sizeX: 6,
		sizeY: 5,
	}
	data: any = [];
	charts: any = [];
	xAxisData: any = [];

	visualizationTypes = [
		{ id: 'chart', name: 'CHART' }
	];
	chartTypes = [
		{ id: 'line', name: 'LINE' },
		{ id: 'bar', name: 'BAR' },
		{ id: 'area', name: 'AREA' },
		{ id: 'pie', name: 'PIE' },
		{ id: 'scatter', name: 'SCATTER' },
		{ id: 'bubble', name: 'BUBBLE' },
		{ id: 'heatmap', name: 'HEATMAP' },
		{ id: 'box', name: 'BOX' }
	];
	scaleTypes = [
		{ id: 'auto_detect', name: 'Auto Detect' },
		{ id: 'date', name: 'Datetime' },
		{ id: 'linear', name: 'Linear' },
		{ id: 'log', name: 'Logarithmic' },
		{ id: 'category', name: 'Category' }
	];
	colorTypes = [
		{ id: '', name: 'Automatic' },
		{ id: 'blue', name: 'Blue' },
		{ id: 'red', name: 'Red' },
		{ id: 'green', name: 'Green' },
		{ id: 'purple', name: 'Purple' },
		{ id: 'cyan', name: 'Cyan' },
		{ id: 'orange', name: 'Orange' },
		{ id: 'light blue', name: 'Light Blue' },
		{ id: 'lilac', name: 'Lilac' },
		{ id: 'light green', name: 'Light Green' },
		{ id: 'brown', name: 'Brown' },
		{ id: 'black', name: 'Black' },
		{ id: 'gray', name: 'Gray' },
		{ id: 'pink', name: 'Pink' },
		{ id: 'dark blue', name: 'Dark Blue' },
		{ id: 'indian red', name: 'Indian Red' },
		{ id: 'green 2', name: 'Green 2' },
		{ id: 'green 3', name: 'Green 3' },
		{ id: 'dark violet', name: 'Dark Violet' },
		{ id: 'pink 2', name: 'Pink 2' },
		{ id: 'darkturquoise', name: 'Darkturquoise' }
	];

	xColumnsList = [];
	yColumnsList = [];

	chartForm = this.fb.group({
		visualizationType: ['chart', Validators.required],
		visualizationName: [''],
		general: this.fb.group({
			chartType: ['bar'],
			xColumn: ['', Validators.required],
			yColumns: ['', Validators.required],
			groupBy: [''],
			showLegends: [false]
		}),
		xaxis: this.fb.group({
			scale: [''],
			name: [''],
			sortValue: [''],
			reverseOrder: [false],
			showLabels: [true]
		}),
		yaxis: this.fb.group({
			scale: [''],
			name: [''],
			minValue: [''],
			maxValue: [''],
			sortValue: [''],
			reverseOrder: [false]
		}),
		series: this.fb.array([])
	});

	constructor(public translate: TranslateService,
		public globals: Globals,
		private fb: FormBuilder,
		public authService: AuthService,
		private widgetService: DatasourceWidgetService,
		private router: Router
	) {

	}

	get series() { return this.chartForm.get('series') as FormArray; }
	set series(seriesArray: FormArray) { this.chartForm.setControl('series', seriesArray); }

	get general() { return this.chartForm.get('general') }
	get xaxis() { return this.chartForm.get('xaxis') }
	get yaxis() { return this.chartForm.get('xaxis') }

	get generalChartType() { return this.chartForm.get('general').get('chartType'); }

	get xColumn() { return this.chartForm.get('general').get('xColumn'); }
	get yColumns() { return this.chartForm.get('general').get('yColumns'); }

	get groupByColumns() {
		const ySelectedCols: any = this.yColumns == null ? [] : this.yColumns.value;
		const xSelectedCols: any = this.xColumn == null ? [] : this.xColumn.value;

		let difference = this.xColumnsList.filter(x => !ySelectedCols.includes(x));
		difference = difference.filter(x => !xSelectedCols.includes(x));
		return difference;
	}

	ngOnInit() {

		const recordId = history.state.recordId;

		console.log('record ID: ', recordId);

		this.plotlyElement = this.plotlyChartContainer;
		this.Plotly = this.plotlyElement.plotly;
		// this.plotlyElement.updatePlot();
		this.plotlyElement = this.plotlyElement.plotEl.nativeElement;

		this.initializeRegistrationForm();
		this.initializeLoginForm();

		// set columns to both x and y columns dorpdown
		this.xColumnsList = this.columns;
		this.yColumnsList = this.columns;
		console.log('rows', this.rows);
		console.log('columns', this.columns);


		// this.data.push(this.trace1);
		// this.data.push(this.trace2);
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

	close() {
		this.closeFlag.emit();
	}

	checkUserLoggedIn() {
		if (this.authService.isLoggedIn()) {
			console.log('Saving Visualization');
			this.save();
		} else {
			this.showSignUpPopUp();
		}
	}

	save() {

		const data = {
			name: this.chartForm.get('visualizationName').value,
			user: this.authService.getLoggedInUserId(),
			config: JSON.stringify(this.chartForm.value),
			data: JSON.stringify(this.data)
		}

		this.widgetService.createWiget(data).subscribe(res => {
			console.log('widget save data: ', res);
			swal({
				title: this.translate.instant('WELL_DONE'),
				text: this.translate.instant('WIDGET_SUBMITTED'),
				buttonsStyling: false,
				confirmButtonClass: 'btn btn-fill btn-success',
				type: 'success'
			}).catch(swal.noop)

			this.close();
		}, err => {
			console.error('error saving widget: ', err);
			swal({
				title: this.translate.instant('Error!'),
				text: this.translate.instant('Something went wrong!'),
				buttonsStyling: false,
				confirmButtonClass: 'btn btn-fill btn-danger',
				type: 'error'
			}).catch(swal.noop)
		});
	}

	showSignUpPopUp() {
		$('#signupModal').modal();
		$('#home').tab('show');
	}

	// preSetValues() {
	// 	this.chartForm.patchValue({
	// 		visualizationType: 'chart',
	// 		general: {
	// 			chartType: 'bar'
	// 		}
	// 	});
	// }

	changeTab(vl) {
		$('a[href="#' + vl + '"]').tab('show');
	}

	ngAfterViewInit() {
		// setTimeout(()=> {
		// 	this.preSetValues();
		// });



		$('.multi-select2').select2().on('change', (event) => {
			this.onChangeYaxisColumn(event);
		});

		this.chartForm.valueChanges.subscribe((event) => {
			if (event.visualizationName != null && event.visualizationName !== '') {
				this.layout.title = event.visualizationName;
			}

			// General
			if (event.general.chartType != null && event.general.chartType !== '') {
				this.plotlyConfig.type = event.general.chartType;
				// also update the chart type for all series entries
			}
			if (event.general.xColumn != null && event.general.xColumn !== '') {
				this.plotlyConfig.title = event.general.xColumn;
			}
			if (event.general.yColumns != null && event.general.yColumns !== '') {
				this.plotlyConfig.title = event.general.yColumns;
			}
			if (event.general.groupBy != null && event.general.groupBy !== '') {
				this.plotlyConfig.title = event.general.groupBy;
			}
			if (event.general.showLegends != null) {
				this.layout.showlegend = event.general.showLegends;
			}

			// x Axis
			if (event.xaxis.scale != null && event.xaxis.scale !== '') {
				this.layout.xaxis.type = event.xaxis.scale;
			}
			if (event.xaxis.name != null && event.xaxis.name !== '') {
				this.layout.xaxis.title = event.xaxis.name;
			}
			if (event.xaxis.showLabels != null) {
				this.layout.xaxis.showticklabels = event.xaxis.showLabels;
			}
			if (event.xaxis.reverseOrder != null) {
				if (event.xaxis.reverseOrder) {
					this.layout.xaxis.autorange = 'reversed';
				} else {
					this.layout.xaxis.autorange = '';
				}
			}

			// y Axis
			if (event.yaxis.scale != null && event.yaxis.scale !== '') {
				this.layout.yaxis.type = event.yaxis.scale;
			}
			if (event.yaxis.name != null && event.yaxis.name !== '') {
				this.layout.yaxis.title = event.yaxis.name;
			}
			if (event.yaxis.minValue !== '' && event.yaxis.maxValue !== '') {
				// this.layout.yaxis.range[0] = Number(event.yaxis.minValue);
				// this.layout.yaxis.range[1] = Number(event.yaxis.maxValue);
			}

			this.redraw();
		});

		// on change of chartType, all type of series entries must also change and set similar to chartTYpe value
		this.chartForm.get('general').get('chartType').valueChanges.subscribe((event) => {
			if (event != null && event !== '') {
				this.series.controls.forEach(entry => {
					const seriesEntryTypeVal = entry.get('type').value;
					if (seriesEntryTypeVal !== event) {
						entry.get('type').setValue(event);
					}
				});

				// also change the type for data array that feeded to plotly
				this.data.forEach(entry => {
					entry.type = event;
				})
			}
		});

		// on selection of Y columns, there should be same amount of rows in series tab
		this.chartForm.get('general').get('yColumns').valueChanges.subscribe((event) => {
			if (event != null && event !== '') {
				this.addSeries(event);
			}
		});

	}

	// on change of x-axis column selection, 
	// 1. the given column should be removed from yColumns dropdown
	// 2. Also remove that column from chartForm if selected earlier
	onChangeXaxisColumn($event) {
		// fetch the data of selected column as array
		this.xAxisData = this.unpack(this.rows, this.columns.indexOf($event.currentTarget.value));
		for (let index = 0; index < this.data.length; index++) {
			const element = this.data[index];
			element.x = this.xAxisData;
		}

		// set the scale based on datatype, for text column the scale should be category
		if (this.identifyColumnDataType($event.currentTarget.value) === 'string') {
			this.layout.xaxis.type = 'category';
			this.xaxis.get('scale').setValue('category');
		} else {
			// this.layout.xaxis.type = 'category';
			this.xaxis.get('scale').setValue('category');
		}

		this.yColumnsList = this.columns.filter(item => item !== $event.currentTarget.value);
		const yColumnsArray = this.chartForm.get('general').get('yColumns').value;
		if (yColumnsArray.length > 0) {
			this.chartForm.get('general').get('yColumns').setValue(yColumnsArray.filter(item => item !== $event.currentTarget.value));
			this.addSeries(this.yColumns.value);
		}
	}

	onChangeYaxisColumn($event) {
		console.log($event);
		const selectedValsObj = $($event.currentTarget).select2('data');
		const selectedVals = [];
		selectedValsObj.forEach(element => {
			selectedVals.push(element.text);
		});
		this.general.get('yColumns').setValue(selectedVals);
	}

	identifyColumnDataType(columnName) {
		const columnData = this.unpack(this.rows, this.columns.indexOf(columnName));
		let loopIterations = columnData.length;
		if (loopIterations > 5) {
			loopIterations = 5;
		}
		for (let index = 0; index < columnData.length; index++) {
			const element = columnData[index];
			if (element === undefined) {
				continue;
			} else if (element == null) {
				continue;
			} else if (element === '') {
				continue;
			} else {
				const numFlag = isNumber(element);
				if (!numFlag) {
					return 'string';
				}
				return 'int';
			}
		}
		return null;
	}

	redraw() {
		this.Plotly.getPlotly().redraw(this.plotlyElement);

		this.Plotly.getPlotly().relayout(this.plotlyElement, {
			'xaxis.autorange': true,
			'yaxis.autorange': true
		});
	}

	unpack(rows, key) {
		return rows.map(function (row) { return row[key]; });
	}

	addSeries(yColumns: any) {
		// add formGroup for each column in array of series
		if (yColumns != null) {
			const serieseFormArray: FormArray = this.fb.array([]);
			const newData = [];
			let index = 0;
			yColumns.forEach((item) => {
				serieseFormArray.push(
					this.fb.group({
						column: [item, Validators.required],
						label: [item, Validators.required],
						type: [this.general.get('chartType').value, [Validators.required]],
						color: ''
						// color: ['blue', Validators.required]
					})
				);

				if (this.generalChartType.value === 'pie') {
					newData[index++] = {
						values: this.unpack(this.rows, this.columns.indexOf(item)),
						labels: this.xAxisData,
						// domain: {column: 0},
						// name: 'GHG Emissions',
						hoverinfo: 'label+percent',
						// hole: .4,
						type: this.general.get('chartType').value,
					};
				} else {
					newData[index++] = {
						x: this.xAxisData,
						y: this.unpack(this.rows, this.columns.indexOf(item)),
						name: item,
						type: this.general.get('chartType').value,
						// color:
					};
				}

			});
			this.series = serieseFormArray;
			this.data = newData;
		}
	}

	onSeriesLabelChange(trace, $event) {
		trace.name = $event.currentTarget.value;
	}

	onSeriesTypeChange(trace, $event) {
		trace.type = $event.currentTarget.value;
	}

	onSeriesColorChange(trace, $event) {
		trace.marker = {
			color: $event.currentTarget.value
		};
	}

	getValue() {
		return JSON.stringify(this.chartForm.value, null, 4)
	}

	getPlotlyConfig() {
		return JSON.stringify(this.plotlyConfig, null, 4)
	}

	getLayout() {
		return JSON.stringify(this.layout, null, 4)
	}

	getData() {
		return JSON.stringify(this.data, null, 4)
	}

	validateNumber(el) {
		const elValue = el.value;
		if (!(/^[0-9]*$/gm).test(elValue) || elValue.length > 10) {
			$(el).val(elValue.slice(0, elValue.length - 1));
		}
	}
	saveLocally() {

		if (this.globals.dashboardType === 'public') {
			this.localChartsArrayName = 'charts';
		} else {
			this.localChartsArrayName = 'pCharts';
		}
		if (!localStorage.hasOwnProperty(this.localChartsArrayName)) {
			localStorage.setItem(this.localChartsArrayName, JSON.stringify(this.charts));
		}
		const chart = {
			data: this.data,
			saved: false,
			state: 'new',
			filteredData: {
				rows: this.rows,
				column: this.columns
			},
			config: this.plotlyConfig,
			layout: this.layout,
			gridstack: this.gridstack
		}
		this.charts = JSON.parse(localStorage.getItem(this.localChartsArrayName));
		const chartLength = this.charts.length;
		if (chartLength === 0) {
			chart['_id'] = 1;
			this.charts.push(chart);
			localStorage.setItem('chartId', JSON.stringify(1));
		} else {
			chart['_id'] = (Number(localStorage.getItem('chartId'))) + 1;
			chart['gridstack'].col = this.globals.maxGridRowColumn;

			// set the row based on the globals.maxRow
			chart['gridstack'].row = this.globals.maxGridRow;

			localStorage.setItem('chartId', JSON.stringify(chart['_id']));
			this.charts.push(chart);
		}

		// Navigate to the relevant compenonet from where the request for chart was made
		// it is either public page or private dashboard edit page
		// if (this.globals.dashboardType === 'public') {
		// 	localStorage.setItem(this.localChartsArrayName, JSON.stringify(this.charts));
		// 	this.router.navigate(['/public-dashboard']);
		// } else {
		// 	// set the dashboard id to the globals dashboardId
		// 	localStorage.setItem(this.localChartsArrayName, JSON.stringify(this.charts));
		// 	this.router.navigate(['custom/my-dashboards/edit'], { state: { recordId: this.globals.privateDashboardId } });
		// }

		if (!this.authService.isLoggedIn()) {
			localStorage.setItem(this.localChartsArrayName, JSON.stringify(this.charts));
			this.router.navigate(['/public-dashboard']);
		} else {

			if (localStorage.getItem('privateDashboardId')) {
				this.globals.privateDashboardId = localStorage.getItem('privateDashboardId');
			}

			// set the dashboard id to the globals dashboardId
			localStorage.setItem(this.localChartsArrayName, JSON.stringify(this.charts));
			this.router.navigate(['custom/my-dashboards/edit'], { state: { recordId: this.globals.privateDashboardId } });
		}

	}


}
