import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Role } from 'app/models/role';
import { HttpClient } from '@angular/common/http';
import { RoleService } from 'app/services/node/role.service';
import { PermissionService } from 'app/services/node/permission.service';
import { AuthService } from 'app/services/auth.service';
import { Globals } from 'app/core';
import { DatatablesService } from 'app/services/datatables.service';
import { AuthPrincipal } from '../AuthPrinicipal';
import { DatasourceDashboardService } from 'app/services/datasource.dashboard.service';
import { DatasourceWidgetService } from 'app/services/datasource.widget.service';
import { DatasourceDashboard } from 'app/models/datasource.dashboard';
import { Router } from '@angular/router';

declare var $: any;

@Component({
	selector: 'app-mydashboard',
	templateUrl: './mydashboard.component.html',
	styleUrls: ['./mydashboard.component.scss']
})
export class MydashboardComponent implements OnInit, OnDestroy, AfterViewInit {


	result: DatasourceDashboard[];
	roleData;
	allPermissionsData;
	showEditModal;
	showViewModal;
	showCreateModal;
	dataTablesObservable;
	dTable;
	dTableFlag = false;

	// datatables options
	dtOptions = {};

	headerRow = ['Name', 'Actions'];
	isLoading = true;
	loading;
	viewLoading;
	editLoading;
	authPrincipal: AuthPrincipal = new AuthPrincipal(false, [], null);

	constructor(public httpClient: HttpClient,
		private datasourceDashboardService: DatasourceDashboardService,
		private datasourceWidgetService: DatasourceWidgetService,
		public authService: AuthService,
		public globals: Globals,
		private cdref: ChangeDetectorRef,
		private datatables: DatatablesService,
		private router: Router
	) { }

	ngOnInit() {

		// Remove the cached data for the previous dashboard
		if (localStorage && localStorage.getItem('pCharts')) {
			localStorage.removeItem('pCharts');
		}

		// Remove the privateDashboardId
		if (localStorage && localStorage.getItem('privateDashboardId')) {
			localStorage.removeItem('privateDashboardId');
		}


		this.reloadData();

		this.dtOptions = {
			'pagingType': 'full_numbers',
			'lengthMenu': [[10, 25, 50, -1], [10, 25, 50, 'All']],
			responsive: true,
			language: this.datatables.selectedJsonFile
		};
		this.changeLanguage();
		this.authPrincipal = JSON.parse(localStorage.getItem('authPrincipal'));

		console.log('Perm', this.authPrincipal);

	}

	ngAfterViewInit() {
	}


	changeLanguage() {

		this.dataTablesObservable = this.datatables.callToServiceMethodSource.subscribe(data => {
			this.dtOptions['oLanguage'] = data.default;
			if (this.dTableFlag) {
				// Initialize datatable if not initialized before
				if (!$.fn.DataTable.isDataTable('#datatables')) {
					this.dTable = $('#datatables').DataTable(this.dtOptions);
				} else {
					console.log('dtOptions: ', this.dtOptions);
					this.dTable.destroy();
					this.dTable = null;
					this.dTable = $('#datatables').DataTable(this.dtOptions);
				}
			}
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

	reloadData() {
		// this.result = [];
		this.loading = true;
		this.dTableFlag = false;
		this.datasourceDashboardService.loadByUserId().subscribe(data => {
			console.log('My dashboards:', data);

			this.result = data.dashboards;
			this.dTableFlag = true;
			this.cdref.detectChanges();
			this.loading = false;

			this.initTable();
			this.isLoading = false;
			console.log('pDashboards: ', data);

			// console.log('roles data ', this.result);

		}, (err) => {
			console.log('data error: ', err);
			this.loading = false;
		});
	}

	initTable() {
		// Initialize datatable if not initialized before
		if (!$.fn.DataTable.isDataTable('#datatables')) {
			console.log('Initialized in reloadData');
			this.dTable = $('#datatables').DataTable(this.dtOptions);
		} else {
			console.log('Reinitialized in reloadDatd');
			this.dTable.destroy();
			this.dTable = null;
			this.dTable = $('#datatables').DataTable(this.dtOptions);
		}

	}

	addNew(role?: Role) {
		// if (!this.globals.principal.hasAuthority(['ROLE_CREATE', 'ADMIN'])) {
		// 	return false;
		// }
		this.loading = false;
		$('#createModal').modal();
		this.showCreateModal = true;


	}

	viewRecord(recordId) {


		// if (!this.globals.principal.hasAuthority(['ADMIN', 'ROLE_VIEW'])) {
		// 	return false;
		// }
		this.router.navigate(['/custom/my-dashboards/edit'], {
			state: {
				recordId: recordId,
				readonly: true
			}
		});

	}

	editRecord(recordId) {
		// if (!this.editLoading) {
		// 	this.editLoading = true;
		// 	// if (!this.globals.principal.hasAuthority(['ADMIN', 'ROLE_EDIT'])) {
		// 	// 	return false;
		// 	// }

		// 	this.datasourceDashboardService.loadById(recordId).subscribe(data => {
		// 		this.editLoading = false;
		// 		// console.log('the role coming is:' + JSON.stringify(data));
		// 		this.roleData = data;
		// 		$('#editModal').modal();
		// 		this.showEditModal = true;
		// 	}, err => {
		// 		this.editLoading = false;
		// 	});
		// }
		console.log('Data', recordId);

		this.globals.privateDashboardId = recordId;

		this.router.navigate(['/custom/my-dashboards/edit'], {
			state: {
				recordId: recordId,
				readonly: false
			}
		});


	}


	ngOnDestroy() {
		if (this.dataTablesObservable) {
			this.dataTablesObservable.unsubscribe();
		}
	}
}
