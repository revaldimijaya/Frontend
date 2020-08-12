import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-card-playlist',
  templateUrl: './card-playlist.component.html',
  styleUrls: ['./card-playlist.component.scss']
})
export class CardPlaylistComponent implements OnInit {
  @Input() playlist

  details: any;
  video: any;
  videoThumbnail: string;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getDetail();
  }

  getDetail(){
    this.apollo.query({
      query: gql`
      query getDetail($id: Int!){
        getPlaylistVideo(playlistid: $id){
          id,
          playlist_id,
          video_id
        }
      }
      `,
      variables:{
        id: this.playlist.id
      }
    }).subscribe(result =>{
      this.details = result.data.getPlaylistVideo;
      console.log(this.details);
      if(this.details.length != 0){
        this.getVideoId();
        console.log(this.details.length)
      } else {
        this.videoThumbnail="https://firebasestorage.googleapis.com/v0/b/tpa-web-71a78.appspot.com/o/no-thumbnail.jpg?alt=media&token=b8482f56-e21f-4cd6-bd51-59ed3c8e4688"
      }
    })
  }

  getVideoId(){
    this.apollo.query({
      query: gql`
      query getVideoById($id: Int!){
        getVideoId(videoid: $id){
          id,
          user_id,
          url,
          watch,
          like,
          dislike,
          restriction,
          location,
          name,
          premium,
          category,
          thumbnail,
          description,
          visibility
        }
      }
      `,
      variables:{
        id:this.details[0].video_id
      }
    }).subscribe(result =>{
      this.video = result.data.getVideoId
      this.videoThumbnail = this.video.thumbnail
    })
  }

}
