import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChCommunityComponent } from './ch-community.component';

describe('ChCommunityComponent', () => {
  let component: ChCommunityComponent;
  let fixture: ComponentFixture<ChCommunityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChCommunityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
