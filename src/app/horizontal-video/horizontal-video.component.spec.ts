import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalVideoComponent } from './horizontal-video.component';

describe('HorizontalVideoComponent', () => {
  let component: HorizontalVideoComponent;
  let fixture: ComponentFixture<HorizontalVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizontalVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
