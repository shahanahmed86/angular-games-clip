import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { AppRoutingModule } from './app-routing.module';
import { UserModule } from './user/user.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { environment } from 'src/environments/environment';

@NgModule({
	declarations: [AppComponent, NavComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		UserModule,
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireAuthModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {}
