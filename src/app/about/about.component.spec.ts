import { AboutComponent } from './about.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('About Component', () => {
	let component: AboutComponent;
	let fixture: ComponentFixture<AboutComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AboutComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(AboutComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
