import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChPlaylistComponent } from './ch-playlist.component';

describe('ChPlaylistComponent', () => {
  let component: ChPlaylistComponent;
  let fixture: ComponentFixture<ChPlaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChPlaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
