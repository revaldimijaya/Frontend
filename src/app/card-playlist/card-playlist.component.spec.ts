import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPlaylistComponent } from './card-playlist.component';

describe('CardPlaylistComponent', () => {
  let component: CardPlaylistComponent;
  let fixture: ComponentFixture<CardPlaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardPlaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
