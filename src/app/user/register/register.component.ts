import { Component } from '@angular/core';
import { FormGroup, FormControl, Validator, Validators } from '@angular/forms';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})
export class RegisterComponent {
	registerForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		email: new FormControl(''),
		age: new FormControl(''),
		password: new FormControl(''),
		confirmPassword: new FormControl(''),
		phone: new FormControl('')
	});
}
