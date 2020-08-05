import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag'
@Component({
  selector: 'app-playlist-video',
  templateUrl: './playlist-video.component.html',
  styleUrls: ['./playlist-video.component.scss']
})
export class PlaylistVideoComponent implements OnInit {
  @Input() detailVideo

  videos: any;
  user: any;
  toggle_etc:boolean;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    console.log(this.detailVideo);
    this.toggle_etc = false;
    this.getVideo();
  }

  toggleEtc(){
    this.toggle_etc = !this.toggle_etc;
  }

  href(id: number){
    var target = "/video/" + id.toString();
    window.location.href=target;
  }

  getVideo(){
    this.apollo.query({
      query: gql `
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
        id: this.detailVideo.video_id
      }
    }).subscribe(result => {
      this.videos = result.data.getVideoId;
      console.log(this.videos)
      this.getUser(this.videos)
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getUser(temp: any){
    this.apollo.query({
      query: gql `
        query getUserId($id: String!) {
          getUserId(userid: $id) {
            id,
            name,
            membership,
            photo,
            subscriber
          }
        }
      `,
      variables:{
        id: temp.user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }
}
