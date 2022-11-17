import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { combineLatest, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ClipService } from 'src/app/services/clip.service';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { v4 as uuid } from 'uuid';

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
	screenshots: string[] = [];
	selectedScreenshot = '';
	screenshotTask?: AngularFireUploadTask;

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
		private router: Router,
		public ffmpegService: FfmpegService
	) {
		auth.user.subscribe((user) => (this.user = user));
		this.ffmpegService.init();
	}

	ngOnDestroy() {
		this.task?.cancel();
	}

	async storeFile(ev: Event) {
		if (this.ffmpegService.isRunning) return;

		this.isDragover = false;

		this.file = (ev as DragEvent).dataTransfer
			? (ev as DragEvent).dataTransfer?.files.item(0) ?? null
			: (ev.target as HTMLInputElement).files?.item(0) ?? null;

		if (!this.file || this.file.type !== 'video/mp4') return;

		this.screenshots = await this.ffmpegService.getScreenshots(this.file);

		this.selectedScreenshot = this.screenshots[0];

		this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
		this.nextStep = true;
	}

	async uploadFile() {
		this.uploadForm.disable();

		this.showAlert = true;
		this.alertColor = 'blue';
		this.alertMessage = 'Please wait! Your clip is being uploaded.';
		this.inSubmission = true;
		this.showPercentage = true;

		const filename = `${uuid()}-${this.file?.name}`;
		const clipPath = `clips/${filename}`;

		const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot);
		const screenshotPath = `screenshots/${filename}.png`;

		this.task = this.storage.upload(clipPath, this.file);
		const clipRef = this.storage.ref(clipPath);

		this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
		const screenshotRef = this.storage.ref(screenshotPath);

		combineLatest([
			this.task.percentageChanges(),
			this.screenshotTask.percentageChanges()
		]).subscribe(([clipProgress, screenshotProgress]) => {
			if (!clipProgress || !screenshotProgress) return;

			const total = clipProgress + screenshotProgress;

			this.percentage = (total as number) / 200;
		});

		forkJoin([this.task.snapshotChanges(), this.screenshotTask.snapshotChanges()])
			.pipe(switchMap(() => forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])))
			.subscribe({
				next: async ([clipURL, screenshotURL]) => {
					const clip = {
						uid: this.user?.uid!,
						displayName: this.user?.displayName!,
						title: this.title.value,
						filename,
						url: clipURL,
						screenshotURL,
						timestamp: firebase.firestore.FieldValue.serverTimestamp(),
						screenshotFilename: `${filename}.png`
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
