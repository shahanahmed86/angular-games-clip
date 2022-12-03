import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { TabsContainerComponent } from './tabs-container.component';
import { TabComponent } from '../tab/tab.component';

@Component({
	template: `
		<app-tabs-container>
			<app-tab tabTitle="Tab 1">Tab 1</app-tab>
			<app-tab tabTitle="Tab 2">Tab 2</app-tab>
		</app-tabs-container>
	`
})
class TestHostContainer {}

describe('TabsContainerComponent', () => {
	let component: TestHostContainer;
	let fixture: ComponentFixture<TestHostContainer>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TabsContainerComponent, TabComponent, TestHostContainer]
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostContainer);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have two (02) tabs', () => {
		const tabs = fixture.debugElement.queryAll(By.css('li'));
    const containerComponent = fixture.debugElement.query(By.directive(TabsContainerComponent));
    
    const tabsProps = containerComponent.componentInstance.tabs;

    expect(tabs.length)
      .withContext("tabs didn't render")
      .toBe(2);
    expect(tabsProps.length).withContext("Couldn't grab component property").toBe(2);
	});
});
