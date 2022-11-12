import { Component } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { FormGroup, FormControl, Validator, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent {
	inSubmission = false;
	constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

	name = new FormControl('', [Validators.required, Validators.minLength(3)]);
	email = new FormControl('', [Validators.required, Validators.email], [this.emailTaken.validate]);
	age = new FormControl<number | null>(null, [
		Validators.required,
		Validators.min(18),
		Validators.max(120)
	]);
	password = new FormControl('', [
		Validators.required,
		Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
	]);
	confirmPassword = new FormControl('', [Validators.required]);
	phone = new FormControl('', [
		Validators.required,
		Validators.minLength(12),
		Validators.maxLength(12)
	]);

	registerForm = new FormGroup(
		{
			name: this.name,
			email: this.email,
			age: this.age,
			password: this.password,
			confirmPassword: this.confirmPassword,
			phone: this.phone
		},
		[RegisterValidators.match('password', 'confirmPassword')]
	);

	async register() {
		try {
			this.showAlert = true;
			this.alertMessage = 'Please wait, your account is being created';
			this.alertColor = 'blue';
			this.inSubmission = true;

			await this.auth.createUser(this.registerForm.value as IUser);
		} catch (error: FirebaseError | unknown) {
			console.log({ error });

			if (error instanceof FirebaseError && error.code.startsWith('auth/')) {
				this.alertMessage = error.message;
			} else {
				this.alertMessage = 'An unexpected error occurred, please try again later';
			}

			this.alertColor = 'red';
			this.inSubmission = false;

			return;
		}
		this.alertMessage = 'Success, your account has been created';
		this.alertColor = 'green';
	}

	showAlert = false;
	alertMessage = 'Please wait, your account is being created';
	alertColor = 'blue';
}
