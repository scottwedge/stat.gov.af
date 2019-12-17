import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { DatasourceDashboardService } from 'app/services/datasource.dashboard.service';
import { DatasourceWidgetService } from 'app/services/datasource.widget.service';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { GridStackItem, GridStackOptions, GridStackItemComponent, GridStackComponent } from 'ng4-gridstack'
import { Dashboard, dashboardGridOptions } from '../../../../../models/dashboard';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from 'app/core';
import { DatasourceDashboard } from 'app/models/datasource.dashboard';


declare var $: any;


@Component({
	selector: 'app-edit-dashboard',
	templateUrl: './edit-dashboard.component.html',
	styleUrls: ['./edit-dashboard.component.scss']
})
export class EditDashboardComponent implements OnInit, AfterViewInit {
	recordId: any;
	dashboard: any;
	showCreateModal: boolean;
	showEditModal: boolean;
	loading: boolean;
	allWidgets: any;
	originalDashboard;
	charts;
	dsModified;
	readOnly;
	allWidgetsLoaded = false;
	newWidgets;
	newWidgetsIds;
	modifiedWidgets;
	deletedWidgets;
	deletedWidgetIds;
	modifiedWidgetsIds: any;

	constructor(
		private datasourceDashboardService: DatasourceDashboardService,
		private translate: TranslateService,
		private datasourceWidgetService: DatasourceWidgetService,
		private router: Router,
		private authService: AuthService,
		private widgetService: DatasourceWidgetService,
		public globals: Globals
	) { }

	ngOnInit() {

		this.recordId = history.state.recordId;
		this.readOnly = history.state.readonly;

		this.charts = [];
		this.allWidgets = [];
		this.deletedWidgetIds = [];
		this.deletedWidgets = {
			dashboardId: '',
			wIds: []
		};
		this.newWidgets = [];
		this.newWidgetsIds = [];
		this.modifiedWidgets = {
			dashboardId: '',
			grids: []
		};

		console.log('Read Only: ', this.readOnly);

		console.log('record ID: ', this.recordId);

		this.charts = JSON.parse(localStorage.getItem('pCharts'));
		console.log('charts: ', this.charts);



		setTimeout(() => {
			this.initGridstack();
		}, 10);

		// Check if the page is not hard refreshed
		if (this.globals.privateDashboardId) {

			if (localStorage && localStorage.getItem('pCharts') && localStorage.getItem('pCharts').length) {
				console.log('From local');
				this.charts = JSON.parse(localStorage.getItem('pCharts'));
				setTimeout(() => {
					this.initGridstack();
				}, 10);

				// See if dashboard is modified
				this.charts.map(chart => {
					if (chart.state === 'new' || chart.state === 'modified') {
						this.dsModified = true;
					}
				});
			} else {
				if (localStorage && localStorage.getItem('pCharts')) {
					localStorage.removeItem('pCharts');
				}
				console.log('From Server');

				this.fetchDashboardWidgets();
			}
		} else {
			this.router.navigate(['/custom/my-dashboards']);
		}

	}


	fetchDashboardWidgets() {

		// Clear the cache before getting the charts from server
		if (localStorage && localStorage.getItem('pCharts')) {
			localStorage.removeItem('pCharts');
		}

		this.datasourceDashboardService.loadById(this.recordId).subscribe((data) => {
			this.dashboard = data;

			// This is to undo all the changes if user want to
			this.originalDashboard = data;

			// Add stat temp value to each widget to track
			this.dashboard.widgets.map(w => {
				w.state = 'unchanged'
			});

			// Save the charts locally to avoid redirect reloading
			if (localStorage) {
				this.charts = this.dashboard.widgets;
				this.charts.map(chart => {
					chart.saved = true
				});
				localStorage.setItem('pCharts', JSON.stringify(this.charts));
				this.dsModified = false;
			} else {
				alert('Sorry your browser doesnt support localstorage');
			}

			setTimeout(() => {
				this.initGridstack();
			}, 10);
			console.log('Data', data);

		}, (err) => {

			console.log('Dashboard ID doesn\'t exist!');

		});
	}


	initGridstack() {
		$('.grid-stack').gridstack({

			animate: true,
			auto: true,
			width: 12,
			float: true,

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

		document.querySelectorAll('[data-title="Autoscale"]').forEach(el => {
			(<HTMLElement>el).click()
		});

		this.initGridstackEvents();
	}


	reloadData() {
		// this.result = [];
		this.datasourceDashboardService.loadById(this.recordId).subscribe(data => {
			this.dashboard = data;

		}, (err) => {
			console.log('data error: ', err);
		});
	}


	toggleModal(data) {
		$('#createModal').modal('hide');
		if (data.modalType === 'create') {
			$('#createModal').modal('hide');
			$('#createModal').on('hidden.bs.modal', (e) => {
				$('#createModal').off('hidden.bs.modal');
				this.showCreateModal = false;
				if (data.newRecord) {
					this.reloadData();
				}
			});
		}

		if (data.modalType === 'edit') {
			$('#editModal').modal('hide');
			$('#editModal').on('hidden.bs.modal', (e) => {
				this.showEditModal = false;
				$('#editModal').off('hidden.bs.modal');
				if (data.button === 'update') {
					console.log('Update');
					this.reloadData();
				}
			});
		}
	}

	refresh() {
		this.reloadData();
	}

	saveNewGridAttributes(elem) {

		const chartId = $(elem).attr('id');
		this.charts.map(chart => {

			if (String(chart._id) === chartId) {
				console.log('O/charId: ', chartId);
				console.log('M/chart ID: ', chart._id);
				const chartCurrentValue = JSON.stringify(chart.gridstack);

				console.log('current gridstack: ', chartCurrentValue);
				console.log('Element is : ', elem);

				chart.gridstack.col = Number($(elem).attr('data-gs-x'));
				chart.gridstack.row = Number($(elem).attr('data-gs-y'));
				chart.gridstack.sizeX = Number($(elem).attr('data-gs-width'));
				chart.gridstack.sizeY = Number($(elem).attr('data-gs-height'));

				console.log('changed gridstack: ', JSON.stringify(chart.gridstack));

				// Update the stat only if the values are changed and the widget is unchanged
				if (JSON.stringify(chart.gridstack) !== chartCurrentValue) {
					console.log('changed');
					if (chart.state === 'unchanged') {
						console.log('modified');
						chart.state = 'modified';
						this.dsModified = true;
					}
				} else {
					console.log('Did not change');
				}

			}

			return chart;
		});

		localStorage.setItem('pCharts', JSON.stringify(this.charts));

		// console.log(this.charts);

	}

	initGridstackEvents() {
		const that = this;

		$('.grid-stack').on('gsresizestop', function (event, elem) {
			console.log('resize');
			$('.grid-stack > .grid-stack-item:visible').map(function (i, el) {
				that.saveNewGridAttributes(el);
				const elId = $(elem).attr('id');

				console.log(elId);
				setTimeout(() => {
					const dElement = (<HTMLElement>document.getElementById(elId));
					(<HTMLElement>dElement.querySelector('[data-title="Autoscale"]')).click();
				}, 250);
			});
		});

		$('.grid-stack').on('dragstop', function (event, ui) {
			console.log('drag');
			// Wait until the the state of the element has changed
			setTimeout(() => {
				$('.grid-stack > .grid-stack-item:visible').map(function (i, el) {
					that.saveNewGridAttributes(el);
				});
			}, 10);
		});
	}

	ngAfterViewInit() {

	}



	addNew() {
		// if (!this.globals.principal.hasAuthority(['ROLE_CREATE', 'ADMIN'])) {
		// 	return false;
		// }
		this.loading = true;

		if (!this.allWidgetsLoaded) {

			this.datasourceWidgetService.loadWidgetsByUserId().subscribe((data) => {
				this.allWidgets = data;
				this.allWidgetsLoaded = true;
				$(document).find('.widgets-list').select2({
					width: '60%'
				});
				console.log('all widgets are:', this.allWidgets);
				this.loading = false;
				$('#createModal').modal();
				this.showCreateModal = true;
			});
		} else {
			this.loading = false;
			$('#createModal').modal();
			this.showCreateModal = true;
		}

	}

	removeChart(chartId) {

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
				this.charts.forEach((el, i) => {
					if (el._id === chartId) {
						// this.charts.splice(i, 1);
						el.state = 'deleted';
						this.dsModified = true;
					}
				});

				localStorage.setItem('pCharts', JSON.stringify(this.charts));
			},
			dismiss => {
				console.log(`dialog was dismissed by ${dismiss}`);
			});

	}

	createWidget() {
		$('#createModal').modal('toggle');
		this.showCreateModal = false;
		this.globals.maxGridRow = this.getMaxRow();
		this.globals.privateDashboardId = this.recordId;
		this.globals.dashboardType = 'private';

		localStorage.setItem('privateDashboardId', this.recordId);

		this.router.navigate(['/build-query']);

	}

	saveCharts() {

	}


	getMaxRow() {
		let maxRow = 0;
		let maxRowColumnCount = 0;

		// Find the max row
		this.charts.map(c => {
			if (c.gridstack.row > maxRow) {
				console.log(c.gridstack.row);
				maxRow = c.gridstack.row;
			}

			return c;
		});

		// check if this row is having enough space to add new widget with data-gs-x = 6
		this.charts.filter(c => c.gridstack.row === maxRow).map(c => {
			maxRowColumnCount += c.gridstack.sizeX;
		});

		console.log('Max Row Before: ', maxRow);


		if (maxRowColumnCount > 6) {

			// Shift the max row to next row
			maxRow += 5;
			this.globals.maxGridRowColumn = 0;
		} else {
			// To start from where the first widget finished in that row
			this.globals.maxGridRowColumn = maxRowColumnCount;
		}

		console.log('Max Row After: ', maxRow);
		console.log('Max Column Count: ', maxRowColumnCount);

		return maxRow;
	}


	updateDashboard() {
		this.saveNewWidgets();
	}

	saveNewWidgets() {

		// This is to avoid copy with reference
		const dw = this.charts.filter(chart => chart.state === 'new');
		this.newWidgets = JSON.stringify(dw);
		this.newWidgets = JSON.parse(this.newWidgets);


		if (this.newWidgets.length) {

			this.newWidgets.map(chart => {
				chart.name = chart.layout.hasOwnProperty('title') ? chart.layout.title.text : 'CHART_NAME';
				chart.layout['title'] = chart.name;
				chart.layout = JSON.stringify(chart.layout);
				chart.config = JSON.stringify(chart.config);
				chart.data = JSON.stringify(chart.data);
				chart.gridstack = JSON.stringify(
					[{
						dashboardId: this.recordId,
						gridstack: chart.gridstack
					}]);
				delete chart['_id'];
				delete chart['saved'];
				delete chart['state'];
				delete chart['filteredData'];
				chart.user = this.authService.getLoggedInUserId();
				return chart;
			});

			this.widgetService.addBulkWidgets(this.newWidgets).subscribe(res => {
				console.log(res);
				this.newWidgetsIds = res.ids;

				this.charts.map(chart => {
					chart.saved = true;
					return chart;
				});

				this.updateModifiedWidgets();

			}, err => {
				console.log('err: ', err);
			});
		} else {
			this.updateModifiedWidgets();
		}

	}


	updateModifiedWidgets() {

		this.modifiedWidgets.grids = [];

		this.modifiedWidgets.dashboardId = this.recordId;

		this.charts.map(chart => {
			if (chart.state === 'modified') {
				this.modifiedWidgets.grids.push({
					id: chart._id,
					gridstack: JSON.stringify(chart.gridstack)
				});
			}
		});

		console.log('-- Modified Widgets: ', this.modifiedWidgets);

		if (this.modifiedWidgets.grids.length) {

			this.widgetService.updateBulkWidgets(this.modifiedWidgets).subscribe(res => {
				console.log(res);
				this.modifiedWidgetsIds = res.ids;
				this.removeDeletedWidgets();
			});
		} else {
			this.removeDeletedWidgets();
		}

		console.log('modified Widgets: ', this.modifiedWidgets);

	}

	removeDeletedWidgets() {

		this.deletedWidgets.dashboardId = this.recordId;
		this.deletedWidgets.wIds = [];
		this.charts.map(chart => {
			if (chart.saved && chart.state === 'deleted') {
				this.deletedWidgets.wIds.push(chart._id);
			}
		});

		console.log('deletedWidgets: ', this.deletedWidgets);


		if (this.deletedWidgets.wIds.length) {
			this.widgetService.detachWidgets(this.deletedWidgets).subscribe((res: any) => {
				console.log(res);
				this.deletedWidgetIds = res.ids;


				// get all widget ids that are to be inserted in dashboard
				const dsWidgetIds = [];
				this.charts.map(c => {
					if (c.state !== 'deleted') {
						dsWidgetIds.push(c._id);
					}
				});

				this.updateDashboardWigdets(dsWidgetIds);

			});
		} else {
			const dsWidgetIds = [];
			this.charts.map(c => {
				if (c.state !== 'deleted') {
					dsWidgetIds.push(c._id);
				}
			});
			this.updateDashboardWigdets(dsWidgetIds);
		}

	}

	updateDashboardWigdets(widgetIds) {

		const obj = new DatasourceDashboard();
		obj.name = this.dashboard.name;
		obj.user = this.authService.getLoggedInUserId();
		obj.layout = null;
		obj.widgets = widgetIds;

		console.log('req dashboard: ', obj);


		this.datasourceDashboardService.update(obj, this.recordId).subscribe(res => {



			this.charts.map(c => {
				c.state = 'unchanged';
				c.saved = true;
			});

			localStorage.setItem('pCharts', JSON.stringify(this.charts));
			this.dsModified = false;


			Swal(
				{
					title: 'Updated!',
					text: 'This dashboard is updated',
					type: 'success',
					confirmButtonClass: 'btn btn-fill btn-success',
					buttonsStyling: false
				}
			);

			this.readOnly = true;


		});
	}


}
