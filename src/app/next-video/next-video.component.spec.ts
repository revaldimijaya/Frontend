import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NextVideoComponent } from './next-video.component';

describe('NextVideoComponent', () => {
  let component: NextVideoComponent;
  let fixture: ComponentFixture<NextVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NextVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NextVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
