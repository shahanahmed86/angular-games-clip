import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase/compat/app';
import { last, switchMap } from 'rxjs/operators';
import { ClipService } from 'src/app/services/clip.service';
import { v4 as uuid } from 'uuid';
import { Router } from '@angular/router';

@Component({
	selector: 'app-upload',
	templateUrl: './upload.component.html',
	styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
	isDragover = false;
	file: File | null = null;
	nextStep = false;
	task?: AngularFireUploadTask;

	showAlert = false;
	alertColor = 'blue';
	alertMessage = 'Please wait! Your clip is being uploaded.';
	inSubmission = false;
	showPercentage = false;
	percentage = 0;

	user: firebase.User | null = null;

	title = new FormControl('', {
		validators: [Validators.required, Validators.minLength(3)],
		nonNullable: true
	});

	uploadForm = new FormGroup({
		title: this.title
	});

	constructor(
		private storage: AngularFireStorage,
		private auth: AngularFireAuth,
		private clipsService: ClipService,
		private router: Router
	) {
		auth.user.subscribe((user) => (this.user = user));
	}

	ngOnDestroy() {
		this.task?.cancel();
	}

	storeFile(ev: Event) {
		this.isDragover = false;

		this.file = (ev as DragEvent).dataTransfer
			? (ev as DragEvent).dataTransfer?.files.item(0) ?? null
			: (ev.target as HTMLInputElement).files?.item(0) ?? null;

		if (!this.file || this.file.type !== 'video/mp4') return;

		this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
		this.nextStep = true;
	}

	uploadFile() {
		this.uploadForm.disable();

		this.showAlert = true;
		this.alertColor = 'blue';
		this.alertMessage = 'Please wait! Your clip is being uploaded.';
		this.inSubmission = true;
		this.showPercentage = true;

		const filename = `${uuid()}-${this.file?.name}`;
		const clipPath = `clips/${filename}`;

		this.task = this.storage.upload(clipPath, this.file);
		const clipRef = this.storage.ref(clipPath);

		this.task.percentageChanges().subscribe((progress) => {
			this.percentage = (progress as number) / 100;
		});

		this.task
			.snapshotChanges()
			.pipe(
				last(),
				switchMap(() => clipRef.getDownloadURL())
			)
			.subscribe({
				next: async (url) => {
					const clip = {
						uid: this.user?.uid!,
						displayName: this.user?.displayName!,
						title: this.title.value,
						filename,
						url,
						timestamp: firebase.firestore.FieldValue.serverTimestamp()
					};

					const clipDocRef = await this.clipsService.createClip(clip);

					this.alertColor = 'green';
					this.alertMessage = 'Success! Your clip is now ready to share with the world.';
					this.showPercentage = false;

					setTimeout(() => {
						this.router.navigate(['clip', clipDocRef.id]);
					}, 1000);
				},
				error: (error) => {
					this.uploadForm.enable();

					this.alertColor = 'red';
					this.alertMessage = 'Upload failed! Please try again later.';
					this.inSubmission = true;
					this.showPercentage = false;
					console.error(error);
				}
			});
	}
}
