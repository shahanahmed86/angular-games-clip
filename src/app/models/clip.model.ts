import firebase from 'firebase/compat/app';

export default interface IClip {
	docId?: string;
	uid: string;
	displayName: string;
	title: string;
	filename: string;
	url: string;
	screenshotURL: string;
	timestamp: firebase.firestore.FieldValue;
	screenshotFilename: string;
}
