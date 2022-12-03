import { By } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NavComponent } from './nav.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('NavComponent', () => {
	let component: NavComponent;
	let fixture: ComponentFixture<NavComponent>;
	let mockedAuthService = jasmine.createSpyObj('AuthService', ['createUser', 'logout'], {
		isAuthenticated$: of(true)
	});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NavComponent],
			providers: [{ provide: AuthService, useValue: mockedAuthService }],
			imports: [RouterTestingModule]
		}).compileComponents();

		fixture = TestBed.createComponent(NavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should logout', () => {
		const logoutLink = fixture.debugElement.query(By.css('li:nth-child(3) a'));

		expect(logoutLink.nativeElement.innerText).withContext("User isn't logged in").toBe('logout');

		logoutLink.triggerEventHandler('click');

		const service = TestBed.inject(AuthService);
		expect(service.logout).withContext("couldn't click logout click").toHaveBeenCalledTimes(1);
	});
});
