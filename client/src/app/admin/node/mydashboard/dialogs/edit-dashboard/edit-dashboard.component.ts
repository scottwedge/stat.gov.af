import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DatasourceDashboardService } from 'app/services/datasource.dashboard.service';
import { DatasourceWidgetService } from 'app/services/datasource.widget.service';
import { Router } from '@angular/router';
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

	constructor(
		private datasourceDashboardService: DatasourceDashboardService,
		private datasourceWidgetService: DatasourceWidgetService,
		private router: Router
	) { }

	ngOnInit() {

		this.recordId = history.state.recordId;
		console.log('record ID: ', this.recordId);


		// console.log('Dashboard ID: ', this.router.getCurrentNavigation().extras.state);


		this.datasourceDashboardService.loadById(this.recordId).subscribe((data) => {
			this.dashboard = data;
			console.log('Data', data);
			setTimeout(() => {
				this.initGridstack();
			}, 10);

		}, (err) => {

			console.log('Dashboard ID doesn\'t exist!');
			this.router.navigate(['/custom/my-dashboards']);

		});

	}

	ngAfterViewInit() {

	}

	initGridstack() {
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



	addNew() {
		// if (!this.globals.principal.hasAuthority(['ROLE_CREATE', 'ADMIN'])) {
		// 	return false;
		// }
		this.loading = true;

		this.datasourceWidgetService.loadWidgets().subscribe((data) => {
			this.allWidgets = data;
			console.log('all widgets are:', this.allWidgets);
			this.loading = false;
			$('#createModal').modal();
			this.showCreateModal = true;
		});

	}




}
