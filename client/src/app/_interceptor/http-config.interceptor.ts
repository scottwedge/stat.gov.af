import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

	constructor(private router: Router) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token: string = localStorage.getItem('stat_aut_token');
		console.log('Token: ', token);
		
		if (token) {
			request = request.clone({ headers: request.headers.set('x-access-token', token) });
		}
		console.log('Interceptor', request.headers);


		return next.handle(request).pipe(
			map((event: HttpEvent<any>) => {
				return event;
			}),
			catchError((error: HttpErrorResponse) => {
				console.error(error);
				if (error.status === 401) {
					this.router.navigate(['login']);
				}
				if (error.status === 400) {
					console.log(error.error);
				}
				return throwError(error);
			})
		);
	}
}