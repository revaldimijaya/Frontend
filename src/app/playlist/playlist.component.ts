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
  toggle_share: boolean = false;
  section: string;

  playlist: any;
  firstPlaylist: any;
  detail: any;
  detailLen: number;
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
    this.section = "playlist";
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

  toggleShare(){
    this.toggle_share = !this.toggle_share;
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

  playlistName: string;
  views: number;
  playlistDescription: string;

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
      this.firstPlaylist = this.playlist[0];
      this.playlistName = this.firstPlaylist.name;
      this.playlistDescription = this.firstPlaylist.description;
      this.views = this.firstPlaylist.views;
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
    this.lastIdx = 2;
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
      this.detail = result.data.getPlaylistVideo;
      this.detailLen = this.detail.length;
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

  name: string;
  photo: string;

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
      this.name = this.user.name;
      this.photo = this.user.photo;
      this.getNotif();
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  notifs: any;
  toggle_notif: boolean= false;

  getNotif(){
    this.apollo.query<any>({
      query: gql`
      query getNotif($userid: String!){
        getNotif(userid: $userid){
          id,
          user_id,
          notif_to
        }
      }
      `,
      variables:{
        userid: this.data.user_id
      }
    }).subscribe(result =>{
      this.notifs = result.data.getNotif;
      this.notifs.forEach(element => {
        if(this.data.user_id == element.user_id && this.user.id == element.notif_to){
          this.toggle_notif = true;
        }
      });
      console.log(this.notifs, this.toggle_notif);
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  toggleNotif(){
    if(this.toggle_notif == true){
      this.deleteNotif();
    } else {
      this.createNotif();
    }
  }

  createNotif(){
    this.apollo.mutate<any>({
      mutation: gql`
      mutation createNotif($userid: String!, $notifto: String!){
        createNotif(userid: $userid, notifto: $notifto){
          id,
          user_id,
          notif_to
        }
      }
      `,
      variables:{
        userid: this.data.user_id,
        notifto: this.user.id
      }
    }).subscribe(({data})=>{
      console.log(data);
    })
  }

  deleteNotif(){
    this.apollo.mutate<any>({
      mutation: gql`
      mutation deleteNotif($userid: String!, $notifto: String!){
        deleteNotif(userid: $userid, notifto: $notifto){
          id,
          user_id,
          notif_to
        }
      }
      `,
      variables:{
        userid: this.data.user_id,
        notifto: this.user.id
      }
    }).subscribe(({data})=>{
      console.log(data);
    })
  }

  hrefChannel(){
    window.location.href = "channel/"+this.user.id;
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

  deleteAllPlaylist(){
    this.apollo.mutate({
      mutation: gql`
      mutation deleteAll($id: Int!){
        deleteAllDetail(id: $id)
      }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(({data})=>{
      console.log("got data", data);
    })
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
