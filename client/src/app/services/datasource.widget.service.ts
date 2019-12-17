import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class DatasourceWidgetService {


	private baseUrl = '/api/dashboards';
	private nodeApi = '/node-api/widgets';
	callToWidgetServiceMethodSource = new Subject<any>();

	constructor(
		private http: HttpClient,
		private authService: AuthService
	) { }


	callServiceCmpMethod() {
		console.log('Service method called');
		this.callToWidgetServiceMethodSource.next();
	}

	loadWidgets(): Observable<any> {
		return this.http.get(`${this.nodeApi}/all`);
	}

	loadWidgetsByDashboardID(dashboardId): Observable<any> {
		return this.http.get(`${this.nodeApi}/find-by-dashboard/${dashboardId}`);
	}

	loadWidgetById(id: string): Observable<any> {
		return this.http.get(`${this.nodeApi}/one/${id}`);
	}

	loadWidgetsByUserId(): Observable<any> {
		const userId = this.authService.getLoggedInUserId();
		return this.http.get(`${this.nodeApi}/find-by-user/${userId}`);
	}

	deleteWidget(id: string) {
		return this.http.delete(`${this.nodeApi}/remove/${id}`);
	}

	createWiget(data): Observable<any> {
		return this.http.post(`${this.nodeApi}/create`, data);
	}

	addBulkWidgets(data): Observable<any> {
		return this.http.post(`${this.nodeApi}/bulk-add`, data);
	}

	updateBulkWidgets(data): Observable<any> {
		return this.http.put(`${this.nodeApi}/bulk-update`, data);
	}

	detachWidgets(data) {
		return this.http.put(`${this.nodeApi}/detach`, data);
	}
}
