import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentViewV2Component } from './component-view-v2.component';

describe('ComponentViewV2Component', () => {
  let component: ComponentViewV2Component;
  let fixture: ComponentFixture<ComponentViewV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentViewV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentViewV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
