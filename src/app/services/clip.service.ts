import { Injectable } from '@angular/core';
import {
	AngularFirestore,
	AngularFirestoreCollection,
	DocumentReference,
	QuerySnapshot
} from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { of, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null> {
	public clipsCollection: AngularFirestoreCollection<IClip>;
	pageClips: IClip[] = [];
	pendingRequest = false;

	constructor(
		private db: AngularFirestore,
		private auth: AngularFireAuth,
		private storage: AngularFireStorage,
		private router: Router
	) {
		this.clipsCollection = db.collection('clips');
	}

	createClip(data: IClip): Promise<DocumentReference<IClip>> {
		return this.clipsCollection.add(data);
	}

	getUserClips(sort$: BehaviorSubject<string>) {
		return combineLatest([this.auth.user, sort$]).pipe(
			switchMap((values) => {
				const [user, sort] = values;

				if (!user) return of([]);

				const query = this.clipsCollection.ref
					.where('uid', '==', user.uid)
					.orderBy('timestamp', sort === '1' ? 'desc' : 'asc');

				return query.get();
			}),
			map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
		);
	}

	async updateClip(id: string, title: string) {
		this.clipsCollection.doc(id).update({
			title
		});
	}

	async deleteClip(clip: IClip) {
		const clipRef = this.storage.ref(`clips/${clip.filename}`);
		const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFilename}`);

		await clipRef.delete();
		await screenshotRef.delete();

		await this.clipsCollection.doc(clip.docId).delete();
	}

	async getClips() {
		if (this.pendingRequest) return;

		this.pendingRequest = true;

		let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);
		const l = this.pageClips.length;

		if (l) {
			const lastDocId = this.pageClips[l - 1]?.docId;
			const lastDoc = await this.clipsCollection.doc(lastDocId).get().toPromise();
			query = query.startAfter(lastDoc);
		}

		const snapshot = await query.get();
		console.log('snapshot.docs...', snapshot);

		snapshot.docs.forEach((doc) => {
			const pageClip = { ...doc.data(), docId: doc.id };
			this.pageClips.push(pageClip);
		});

		this.pendingRequest = false;
	}

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.clipsCollection
			.doc(route.params.id)
			.get()
			.pipe(
				map((snapshot) => {
					const data = snapshot.data();

					if (!data) {
						this.router.navigate(['/']);
						return null;
					}

					return data;
				})
			);
	}
}
