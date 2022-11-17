import { Injectable } from '@angular/core';
import { createFFmpeg, FFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
	providedIn: 'root'
})
export class FfmpegService {
	isRunning = false;
	isReady = false;

	private ffmpeg: FFmpeg | null = null;

	constructor() {
		this.ffmpeg = createFFmpeg({ log: true });
	}

	async init() {
		if (this.isReady || !this.ffmpeg) return;

		await this.ffmpeg.load();
		this.isReady = true;
	}

	async getScreenshots(file: File) {
		this.isRunning = true;

		if (!this.ffmpeg) return [];

		const data = await fetchFile(file);
		this.ffmpeg.FS('writeFile', file.name, data);

		const seconds = [1, 2, 3];
		const commands: string[] = [];

		seconds.forEach((second) => {
			commands.push(
				// Input
				'-i',
				file.name,
				// Output Options
				'-ss',
				`00:00:0${second}`,
				'-frames:v',
				'1',
				'-filter:v',
				'scale=510:-1',
				// Output
				`output_0${second}.png`
			);
		});

		await this.ffmpeg.run(...commands);

		const screenshots: string[] = [];

		seconds.forEach((second) => {
			const screenshotFile = this.ffmpeg?.FS('readFile', `output_0${second}.png`);
			if (!screenshotFile) return;

			const screenshotBlob = new Blob([screenshotFile.buffer], { type: 'image/png' });
			const screenshotURL = URL.createObjectURL(screenshotBlob);

			screenshots.push(screenshotURL);
		});

		this.isRunning = false;

		return screenshots;
	}

	async blobFromURL(url: string) {
		const response = await fetch(url);
		const blob = await response.blob();

		return blob;
	}
}
