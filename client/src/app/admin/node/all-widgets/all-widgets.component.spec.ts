import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllWidgetsComponent } from './all-widgets.component';

describe('AllWidgetsComponent', () => {
  let component: AllWidgetsComponent;
  let fixture: ComponentFixture<AllWidgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllWidgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
