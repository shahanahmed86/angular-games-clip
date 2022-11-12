import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
	selector: 'app-manage',
	templateUrl: './manage.component.html',
	styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
	videoOrder = '1';
	constructor(private router: Router, private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.videoOrder = params.sort === '2' ? params.sort : '1';
		});
	}

	sort(ev: Event) {
		const { value } = ev.target as HTMLSelectElement;

		this.router.navigate([], { relativeTo: this.route, queryParams: { sort: value } });
	}
}
