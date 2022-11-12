import {
	Component,
	OnDestroy,
	OnInit,
	Input,
	OnChanges,
	SimpleChanges,
	Output,
	EventEmitter
} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import IClip from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
	selector: 'app-edit',
	templateUrl: './edit.component.html',
	styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
	@Input() activeClip: IClip | null = null;

	inSubmission = false;
	showAlert = false;
	alertColor = 'blue';
	alertMessage = 'Please wait! Updating clip.';

	@Output() update = new EventEmitter();

	clipId = new FormControl('');

	title = new FormControl('', {
		validators: [Validators.required, Validators.minLength(3)],
		nonNullable: true
	});

	editForm = new FormGroup({
		title: this.title,
		id: this.clipId
	});

	constructor(private modal: ModalService, private clipService: ClipService) {}

	ngOnInit() {
		this.modal.register('editClip');
	}

	ngOnDestroy() {
		this.modal.unregister('editClip');
	}

	ngOnChanges(): void {
		if (!this.activeClip) return;

		this.clipId.setValue(this.activeClip.docId!);
    this.title.setValue(this.activeClip.title!);
    this.inSubmission = false;
    this.showAlert = false;
	}

  async submit() {
    if (!this.activeClip) return;

		this.inSubmission = true;
		this.showAlert = true;
		this.alertColor = 'blue';
		this.alertMessage = 'Please wait! Updating clip.';

		try {
			await this.clipService.updateClip(this.clipId.value!, this.title.value);
		} catch (error) {
			this.inSubmission = false;
			this.alertColor = 'red';
			this.alertMessage = 'Something went wrong. Try again later.';
			return;
		}

    this.activeClip.title = this.title.value;
		this.update.emit(this.activeClip);

		this.inSubmission = false;
		this.alertColor = 'green';
		this.alertMessage = 'Success!';
	}
}
