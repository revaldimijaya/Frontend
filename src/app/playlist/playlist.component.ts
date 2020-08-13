import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  animations: [
    trigger(
      'fade', 
      [
        transition(
          ':enter', 
          [
            style({opacity: 0 }),
            animate('2000ms ease-out', 
                    style({opacity: 1 }))
            
          ]
        ),
        transition(
          ':leave', 
          [
            style({opacity: 1 }),
            animate('2000ms ease-in', 
                    style({opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class PlaylistComponent implements OnInit {

  id: number;
  toggle_title: boolean;
  toggle_desc: boolean;
  toggle_more: boolean;
  toggle_privacy: boolean;
  toggle_sort: boolean;
  toggle_self: boolean = false;

  playlist: any;
  detail: any;
  user: any;
  video: any;

  title: string;
  privacy: string;
  description: string;
  updated: Date;

  lastIdx: number;
  observer: IntersectionObserver;

  videoThumbnail: string;

  toggle_subs: boolean;
  change_subs: boolean;

  constructor(private data: DataService, private activatedRoute: ActivatedRoute, private apollo: Apollo) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => { 
      this.id = parseInt(params.get('id'));
    });
    console.log(this.id);

    this.toggle_desc = false;
    this.toggle_title = false;
    this.toggle_more = false;
    this.toggle_privacy = false;
    this.toggle_sort = false;

    this.getPlaylist();
    this.getDetail();

    this.toggle_subs = true;
    this.change_subs = true;
    
  }
  check: any;

  checkSubs(){
    this.apollo.query({
      query: gql`
        query checkSubscribe($userid: String!, $subscribeto: String!){
          checkSubscribe(userid: $userid, subscribeto: $subscribeto){
            id,
            user_id,
            subscribe_to
          }
        }
      `,
      variables:{
        userid: this.data.user_id,
        subscribeto: this.playlist[0].user_id
      }
    }).subscribe(result => {
      this.check = result.data.checkSubscribe;
      console.log(this.check);
      if(this.check.id == ""){
        this.change_subs = true;
      } else {
        this.change_subs = false;
      }
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  subs(){
    this.apollo.mutate({
      mutation: gql`
        mutation createSubscribe($userid: String!, $subscribeto: String!){
          createSubscribe(userid: $userid, subscribeto: $subscribeto){
            id,
            user_id,
           subscribe_to
          }
        }
      `,
      variables:{
        userid: this.data.user_id,
        subscribeto: this.user.id
      }
    }).subscribe(({ data }) => {
      console.log(data)
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  test(){
    console.log(this.title + this.description + this.privacy)
  }

  toggleTitle(){
    this.toggle_title = !this.toggle_title;
  }

  toggleMore(){
    this.toggle_more = !this.toggle_more;
  }

  toggleDesc(){
    this.toggle_desc = !this.toggle_desc;
  }

  togglePrivacy(){
    this.toggle_privacy = !this.toggle_privacy;
  }

  toggleSort(){
    this.toggle_sort = !this.toggle_sort;
  }

  toggleSelf(){

  }

  getPlaylist(){
    this.apollo.query({
      query: gql`
        query getPlaylistId($id: Int!){
          getPlaylistId(playlistid: $id){
            id,
            name,
            description,
            second,
            minute,
            hour,
            day,
            month,
            year,
            privacy,
            user_id,
            views
          }
        }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result =>{
      this.playlist = result.data.getPlaylistId;
      this.checkSubs();
      if(this.playlist[0].user_id == this.data.user_id){
        this.toggle_self = true;
        this.toggle_subs = false;
      }
      this.title = this.playlist[0].name;
      this.description = this.playlist[0].description;
      this.privacy = this.playlist[0].privacy;
      this.updated = new Date(Date.UTC(this.playlist[0].year, this.playlist[0].month, this.playlist[0].day, this.playlist[0].hour, this.playlist[0].minute, this.playlist[0].second));
      this.getUser(this.playlist);
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getDetail(){
    this.lastIdx = 4;
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
        id: this.id
      }
    }).subscribe(result => {
      this.detail = result.data.getPlaylistVideo
      if(this.detail.length != 0){
        this.getVideo(this.detail[0].video_id);
      } else {
        this.videoThumbnail = "https://firebasestorage.googleapis.com/v0/b/tpa-web-71a78.appspot.com/o/no-thumbnail.jpg?alt=media&token=b8482f56-e21f-4cd6-bd51-59ed3c8e4688"
      }
      this.observer = new IntersectionObserver((entry)=>{
        if(entry[0].isIntersecting){
          let container = document.querySelector(".container-vid");
          for(let i = 0 ; i < 4 ; i++){
            
            if(this.lastIdx < this.detail.length){
              
              let div = document.createElement("div");
              let video = document.createElement("app-playlist-video");
              video.setAttribute("detailVideo","detailVideo[this.lastIdx]");
              div.appendChild(video);
              container.appendChild(div);
              this.lastIdx++;
            }
          }
        }
      });
      this.observer.observe(document.querySelector('.footer'));

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
        id: temp[0].user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getVideo(id: number){
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
        id: id
      }
    }).subscribe(result => {
      this.video = result.data.getVideoId;
      this.videoThumbnail = this.video.thumbnail
      
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  update(){
    this.apollo.mutate({
      mutation: gql`
      mutation updatePlaylist($id: Int!, $title: String!, $privacy: String!, $description: String!){
        updatePlaylist(id: $id, title: $title, privacy: $privacy, description: $description){
          id,
          name,
          description,
          second,
          minute,
          hour,
          day,
          month,
          year,
          privacy,
          user_id,
          views
        }
      }
      `,
      variables:{
        id: this.id,
        title: this.title,
        privacy: this.privacy,
        description: this.description
      }
    }).subscribe(({ data }) => {
      new alert("update success");
      window.location.reload();
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  delete(){
    this.apollo.mutate({
      mutation: gql`
        mutation removePlaylist($id: Int!){
          deletePlaylist(id: $id)
        }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(({ data }) => {
      new alert("delete success");
      window.location.reload();
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  

  updateTitle(){
    this.title = (<HTMLInputElement>document.getElementById("title")).value;
    this.update();
  }

  updatePrivacyPublic(){
    this.privacy = "Public"
    this.update();
  }

  updatePrivacyPrivate(){
    this.privacy = "Private"
    this.update();
  }

  updateDescription(){
    this.description = (<HTMLInputElement>document.getElementById("description")).value
    this.update();
  }
}
