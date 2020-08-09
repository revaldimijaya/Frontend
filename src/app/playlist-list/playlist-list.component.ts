import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-playlist-list',
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.scss']
})
export class PlaylistListComponent implements OnInit {
  @Input() playlist
  @Input() video

  toggle_privacy: boolean;

  detail: any;

  constructor(private apollo:Apollo) { }

  ngOnInit(): void {
    console.log(this.video);
    if(this.playlist.privacy == "public"){
      this.toggle_privacy = true;
    } else {
      this.toggle_privacy = false;
    }
  }

  createDetail(){
    this.apollo.mutate({
      mutation: gql `
        mutation createDetail($playlistid: Int!, $videoid: Int!){
          createDetailPlaylist(playlistid: $playlistid, videoid: $videoid){
            id,
            playlist_id,
            video_id
          }
        }
      `,
      variables:{
        playlistid: this.playlist.id,
        videoid: this.video.id
      }
    }).subscribe(({data})=>{
      console.log(data);
    })
  }

  deleteDetail(){
    this.apollo.mutate({
      mutation: gql `
        mutation deleteDetailPlaylistVideo($playlistid: Int!, $videoid: Int!){
          deleteDetailPlaylistVideo(playlistid: $playlistid, videoid: $videoid)
        }
      `,
      variables:{
        playlistid: this.playlist.id,
        videoid: this.video.id
      }
    }).subscribe(({data})=>{
      console.log(data);
    })
  }

}
