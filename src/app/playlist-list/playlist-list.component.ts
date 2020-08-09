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
  toggle_playlist: boolean;

  detail: any;

  constructor(private apollo:Apollo) { }

  ngOnInit(): void {
    console.log(this.video);
    if(this.playlist.privacy.toLowerCase() == "public"){
      this.toggle_privacy = true;
    } else {
      this.toggle_privacy = false;
    }

    this.getDetail();

  }

  togglePlaylist(){
    if(this.toggle_playlist == true){
      this.deleteDetail();
    } else {
      this.createDetail();
    }
    this.toggle_playlist = !this.toggle_playlist;
  }

  getDetail(){
    this.apollo.query({
      query: gql `
        query getDetail($playlistid: Int!, $videoid: Int!){
          getPlaylistByPlaylistVideo(playlistid: $playlistid, videoid: $videoid){
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
    }).subscribe(result =>{
      this.detail = result.data.getPlaylistByPlaylistVideo
      if(this.detail[0].length != 0){
        this.toggle_playlist = true;
      }

    },(error) => {
      console.log('there was an error sending the query', error);
    });
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
    },(error) => {
      console.log('there was an error sending the query', error);
    });
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
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

}
