import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-playlist-sidebar',
  templateUrl: './playlist-sidebar.component.html',
  styleUrls: ['./playlist-sidebar.component.scss']
})
export class PlaylistSidebarComponent implements OnInit {
  @Input() playlist
  constructor() { }

  ngOnInit(): void {
  }

  href(){
    window.location.href = "playlist/"+this.playlist.id
  }

}
