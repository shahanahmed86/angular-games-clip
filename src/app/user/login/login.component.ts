import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	showAlert = false;
	alertMessage = 'Please wait, your account is being signing in';
	alertColor = 'blue'
	credentials = { email: '', password: '' };

	constructor() {}

  ngOnInit(): void { }
  
	login() {
		this.showAlert = true;
		this.alertMessage = 'Please wait, your account is being signing in';
    this.alertColor = 'blue';
    
    console.log(this.credentials)
	}
}
