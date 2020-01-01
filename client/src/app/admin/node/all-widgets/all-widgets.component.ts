import { Component, OnInit } from '@angular/core';
import { DatasourceWidgetService } from 'app/services/datasource.widget.service';

@Component({
	selector: 'app-all-widgets',
	templateUrl: './all-widgets.component.html',
	styleUrls: ['./all-widgets.component.scss']
})
export class AllWidgetsComponent implements OnInit {

	allWidgets;
	loading;
	constructor(private datasourceWidgetService: DatasourceWidgetService) { }

	ngOnInit() {
		this.allWidgets = [];
		this.loading = false;

		this.getAllWidgets();
	}

	getAllWidgets() {
		this.loading = true;
		this.datasourceWidgetService.loadWidgetsByUserId().subscribe((res: any) => {
			console.log('res: ', res);
			this.allWidgets = res.widgets;
			this.loading = false;
		});
	}

}
