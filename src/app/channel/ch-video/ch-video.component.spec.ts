import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChVideoComponent } from './ch-video.component';

describe('ChVideoComponent', () => {
  let component: ChVideoComponent;
  let fixture: ComponentFixture<ChVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
