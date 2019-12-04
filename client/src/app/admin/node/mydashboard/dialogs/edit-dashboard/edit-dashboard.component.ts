import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { DatasourceDashboardService } from 'app/services/datasource.dashboard.service';
import { DatasourceWidgetService } from 'app/services/datasource.widget.service';
import { Router } from '@angular/router';
import { GridStackItem, GridStackOptions, GridStackItemComponent, GridStackComponent } from 'ng4-gridstack'
import { Dashboard, dashboardGridOptions } from '../../../../../models/dashboard';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';


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
	// @Input('isReadOnly') readonly;
	readOnly;
	allWidgetsLoaded = false;


	constructor(
		private datasourceDashboardService: DatasourceDashboardService,
		private translate: TranslateService,
		private datasourceWidgetService: DatasourceWidgetService,
		private router: Router
	) { }

	ngOnInit() {

		this.recordId = history.state.recordId;
		this.readOnly = history.state.readonly;

		this.allWidgets = [];

		console.log('Read Only: ', this.readOnly);

		console.log('record ID: ', this.recordId);

		this.datasourceDashboardService.loadById(this.recordId).subscribe((data) => {
			this.dashboard = data;

			// This is to undo all the changes if user want to
			this.originalDashboard = data;

			// Add stat temp value to each widget to track
			this.dashboard.widgets.map(w => {
				w.state = 'unchanged'
			});
			setTimeout(() => {
				this.initGridstack();
			}, 10);
			console.log('Data', data);

		}, (err) => {

			console.log('Dashboard ID doesn\'t exist!');
			this.router.navigate(['/custom/my-dashboards']);

		});

	}


	initGridstack() {
		$('.grid-stack').gridstack({

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
		console.log('charId: ', chartId);
		this.dashboard.widgets.map(chart => {
			if (chart._id === chartId) {
				console.log('this id matches', chartId);
				console.log($(elem).attr('data-gs-x'));
				console.log('Element is : ', elem);

				chart.gridstack.col = Number($(elem).attr('data-gs-x'));
				chart.gridstack.row = Number($(elem).attr('data-gs-y'));
				chart.gridstack.sizeX = Number($(elem).attr('data-gs-width'));
				chart.gridstack.sizeY = Number($(elem).attr('data-gs-height'));
				chart.state = 'modified';
			}

			return chart;
		});

		console.log(this.dashboard.widgets);

	}

	initGridstackEvents() {
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
				this.dashboard.widgets.forEach((el, i) => {
					if (el._id === chartId) {
						this.dashboard.widgets.splice(i, 1);
					}
				});
			},
			dismiss => {
				console.log(`dialog was dismissed by ${dismiss}`);
			});

	}

	createWidget() {
		$('#createModal').modal('toggle');
		this.showCreateModal = false;

	}

	saveCharts() {

	}







}
