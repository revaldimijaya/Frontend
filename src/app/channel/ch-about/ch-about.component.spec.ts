import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChAboutComponent } from './ch-about.component';

describe('ChAboutComponent', () => {
  let component: ChAboutComponent;
  let fixture: ComponentFixture<ChAboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChAboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
