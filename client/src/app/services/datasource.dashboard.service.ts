import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
	providedIn: 'root'
})
export class DatasourceDashboardService {

	constructor(
		private http: HttpClient,
		private authService: AuthService
	) { }

	private baseUrl = "/api/dashboards";
	private nodeApi = '/node-api/dashboards';

	load(): Observable<any> {
		return this.http.get(`${this.nodeApi}/all`);
	}

	loadById(id: string): Observable<any> {
		return this.http.get(`${this.nodeApi}/one/${id}`);
	}

	loadByUserId(): Observable<any> {
		const userId = this.authService.getLoggedInUserId();
		return this.http.get(`${this.nodeApi}/find-by-user/${userId}`);
	}

	delete(id: string) {
		return this.http.delete(`${this.nodeApi}/remove/${id}`);
	}

	create(data): Observable<any> {
		return this.http.post(`${this.nodeApi}/create`, data);
	}

	update(data, id): Observable<any> {
		return this.http.put(`${this.nodeApi}/update/${id}`, data);
	}
}
