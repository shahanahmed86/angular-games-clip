import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import IUser from '../models/user.model';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private usersCollection: AngularFirestoreCollection<IUser>;
	public isAuthenticated$: Observable<boolean>;

	constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
		this.usersCollection = db.collection('users');
		this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
	}

	public async createUser(data: IUser) {
		if (!data.password) throw new Error('Password not provided!');

		const userCred = await this.auth.createUserWithEmailAndPassword(data.email, data.password);
		if (!userCred.user) throw new Error("User can't be found");

		await this.usersCollection.doc(userCred.user.uid).set({
			name: data.name,
			email: data.email,
			age: data.age,
			phone: data.phone
		});

		await userCred.user.updateProfile({ displayName: data.name });
	}
}
