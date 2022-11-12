import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'app-manage',
	templateUrl: './manage.component.html',
	styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
	videoOrder = '1';
	clips: IClip[] = [];
	activeClip: IClip | null = null;
	sort$: BehaviorSubject<string>;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private clipService: ClipService,
		private modal: ModalService
	) {
		this.sort$ = new BehaviorSubject(this.videoOrder);
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.videoOrder = params.sort === '2' ? params.sort : '1';
			this.sort$.next(this.videoOrder);
		});

		this.clipService.getUserClips(this.sort$).subscribe((docs) => {
			this.clips = [];

			docs.forEach((doc) => {
				this.clips.push({
					...doc.data(),
					docId: doc.id
				});
			});
		});
	}

	sort(ev: Event) {
		const { value } = ev.target as HTMLSelectElement;

		this.router.navigate([], { relativeTo: this.route, queryParams: { sort: value } });
	}

	openModal(ev: Event, clip: IClip) {
		ev.preventDefault();

		this.activeClip = clip;

		this.modal.toggleModal('editClip');
	}

	update(ev: IClip) {
		this.clips.forEach((clip, i) => {
			if (clip.docId == ev.docId) {
				this.clips[i].title = ev.title;
			}
		});
	}

	async deleteClip(ev: Event, clip: IClip) {
		ev.preventDefault();

		await this.clipService.deleteClip(clip);

		this.clips.forEach((element, i) => {
			if (element.docId === clip.docId) this.clips.splice(i, 1);
		});
	}
}
