import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPlaylistComponent } from './modal-playlist.component';

describe('ModalPlaylistComponent', () => {
  let component: ModalPlaylistComponent;
  let fixture: ComponentFixture<ModalPlaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPlaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
