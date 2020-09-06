import { Component, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';
import { SocialAuthService } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag'
import { User } from 'firebase';
import { subscribe } from 'graphql';
import { DataService } from '../data.service'
import { NumberValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  visible = false
  toggle_setting = false;
  toggle_modal = false;
  toggle_user = false;
  toggle_sign: boolean;
  toggle_search: boolean = false;
  toggle_playlist: boolean = false;
  toggle_subscribe: boolean = false;
  toggle_restriction: Boolean = new Boolean();
  toggle_notif: boolean = false;
  toggle_login: boolean = false;

  userDB: any;
  users = [];
  user: SocialUser;
  loggedIn: boolean;
  message: string;
  subscription: any;
  playlist: any;
  notifications: any;
  notifs: any;
  listNotif: string="";
  lastPlaylist: number;
  lastSubscribe: number;
  playlistLen: number = 0;
  subscribeLen: number = 0;
  notificationLen: number = 0;

  searchVideos: any;
  searchPlaylists: any;
  searchChannel: any;

  constructor(private authService: SocialAuthService, private apollo: Apollo, private data: DataService ) { }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });

    if(localStorage.getItem('users') == null){
      this.users = [];
    }
    else{
      this.getUserFromStorage();
      this.data.logged_in = true;
      this.data.user_id = this.user.id;
      this.data.photoUrl = this.user.photoUrl;
      this.getSubscriber();
      this.getPlaylist();
      this.getUser();
      this.getNotif();
      console.log(this.data.user_id);
      this.lastPlaylist = 5;
      this.lastSubscribe = 10;
    }
    
    this.toggle_sign = false;
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      this.addToLocalStorage(user);
      this.createUser(user);
      window.location.reload(); 
    });

  }

  toggleLogin(){
    this.toggle_login = !this.toggle_login;
  }

  toggleSign(){
    this.toggle_sign = !this.toggle_sign;
  }

  toggleSearch(){
    this.toggle_search = !this.toggle_search
  }

  toggleNotif(){
    this.toggle_notif = !this.toggle_notif
  }

  toggleRestriction(){
    if(this.userDB.restriction == "false"){
      this.updateRestriction("true");
    } else {
      this.updateRestriction("false");
    }
  }

  inputSearch(i){
    (<HTMLInputElement>document.getElementById("search")).value = i.name;
  }

  search(){
    window.location.href = "/search/"+(<HTMLInputElement>document.getElementById("search")).value;
  }

  getNotification(){
    this.apollo.query({
      query: gql`
        query getNotification($userid: String!){
          getNotification(userid: $userid){
            id,
            user_id,
            type,
            type_id,
            description,
            thumbnail,
            photo,
            created_at
          }
        }
      `,
      variables:{
        userid: this.listNotif
      }
    }).subscribe(result => {
      this.notifications = result.data.getNotification;
      this.notificationLen = this.notifications.length;
      console.log(this.notifications);
    })
  }

  getNotif(){
    this.apollo.query({
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
    }).subscribe(result => {
      this.notifs = result.data.getNotif
      this.notifs.forEach((element,index) => {
        this.listNotif += element.notif_to;
        if(index != this.notifs.length-1){
          this.listNotif += ",";
        }
      });
      console.log(this.listNotif);
      this.getNotification();
    })
  }

  getUser(){
    this.apollo.query({
      query: gql `
        query getUserId($id: String!) {
          getUserId(userid: $id) {
            id,
            name,
            membership,
            photo,
            subscriber,
            restriction
          }
        }
      `,
      variables:{
        id: this.data.user_id
      }
    }).subscribe(result => {
      this.userDB = result.data.getUserId;
      console.log(this.userDB.restriction);
      if(this.userDB.restriction == "false"){
        this.data.isRestriction = false;
        this.toggle_restriction = false;
      } else {
        this.data.isRestriction = true;
        this.toggle_restriction = true;
      }
      
      console.log(this.toggle_restriction);
    })
  }

  updateRestriction(bool: string){
    this.apollo.mutate({
      mutation: gql`
        mutation updateRestriction($userid: String! ,$bool: String!){
          updateRestriction(userid: $userid, bool: $bool)
        }
      `,
      variables:{
        userid: this.data.user_id,
        bool: bool
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      window.location.href = ' ';
    },(error) => {
      console.log('there was an error sending the query', this.data);
    });
  }

  getPlaylist(){
    this.apollo.query({
      query: gql`
      query getPlaylistUser($userid: String!){
        getPlaylistUser(userid: $userid){
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
        userid: this.data.user_id 
      }
    }).subscribe(result =>{
      this.playlist = result.data.getPlaylistUser
      this.playlistLen = this.playlist.length;
    })
  }

  morePlaylist(){
    this.toggle_playlist = true;
    this.lastPlaylist = this.playlist.length
    let container = document.querySelector(".list-playlist");
    for(let i = 4 ; i < this.playlist.length-1 ; i++){
      let div = document.createElement("div");
      let video = document.createElement("app-playlist-sidebar");
      video.setAttribute("playlist","playlist[i]");
      div.appendChild(video);
      container.appendChild(div);
    }
  }

  hidePlaylist(){
    this.toggle_playlist = false;
    this.lastPlaylist = 5;
  }

  moreSubscription(){
    this.toggle_subscribe = true;
    this.lastSubscribe = this.subscription.length
    let container = document.querySelector(".list-subs");
    for(let i = 4 ; i < this.subscription.length-1 ; i++){
      let div = document.createElement("div");
      let video = document.createElement("app-list-subscription");
      video.setAttribute("subscription","subscription[i]");
      div.appendChild(video);
      container.appendChild(div);
    }
  }

  hideSubscription(){
    this.toggle_subscribe = false;
    this.lastSubscribe = 10;
  }

  createUser(user: any): void {
    console.log(user);
    this.apollo.mutate({
      mutation: gql `
        mutation createUser($id: String!, $name: String!, $membership: String!, $photo: String!, $subscriber: Int!, $views: Int!, $description: String!, $header: String!) {
          createUser(input:{id:$id, name:$name, membership:$membership, photo:$photo, subscriber:$subscriber, views: $views, description: $description, header: $header}){
            id,
            name,
            membership,
            photo,
            subscriber
          }
        }
        `,
        variables:{
          id: user.id,
          name: user.name,
          membership: 'no',
          photo: user.photoUrl,
          subscriber: 0,
          views: 0,
          description: "i'm new",
          header: "https://firebasestorage.googleapis.com/v0/b/tpa-web-71a78.appspot.com/o/101224snowywishmv2.jpg?alt=media&token=007ac3c0-2551-4fbb-ba6a-2ccbb70a6e22"
        }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      window.location.href = ' ';
    },(error) => {
      console.log('there was an error sending the query', this.data);
    });
  }

  getSubscriber(){
    this.apollo.query({
      query: gql `
        query getSubscribeByUser($userid: String!){
          getSubscribeByUser(userid: $userid){
            id,
            user_id,
            subscribe_to
          }
        }
      `,
      variables:{
        userid: this.user.id
      }
    }).subscribe(result =>{
      this.subscription = result.data.getSubscribeByUser
      
      this.subscribeLen = this.subscription.length;
    })
  }

  getSearchVideo(){
    this.apollo.query({
      query: gql`
      query searchVideo($name: String!){
        searchVideo(name: $name){
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
          visibility,
          day,
          month,
          year,
          hour,
          minute,
          second
        }
      }      
      `,
      variables:{
        name: "%"+(<HTMLInputElement>document.getElementById("search")).value+"%"
      }
    }).subscribe(result => {
      this.searchVideos = result.data.searchVideo
    })
  }

  getSearchPlaylists(){
    this.apollo.query({
      query: gql`
      query searchPlaylists($name: String!){
        searchPlaylist(name:$name){
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
        name: "%"+(<HTMLInputElement>document.getElementById("search")).value+"%"
      }
    }).subscribe(result => {
      this.searchPlaylists = result.data.searchPlaylist
    })
  }

  getSearchChannel(){
    this.apollo.query({
      query: gql`
      query searchChannel($name: String!){
        searchChannel(name: $name){
          id,
          name,
          photo,
          membership,
          subscriber,
          created_at,
          views,
          description,
          header
        }
      }
      `,
      variables:{
        name: "%"+(<HTMLInputElement>document.getElementById("search")).value+"%"
      }
    }).subscribe(result => {
      this.searchChannel = result.data.searchChannel
    })
  }

  getAll(){
    this.getSearchChannel();
    this.getSearchPlaylists();
    this.getSearchVideo();
  }

  signOut(): void {
    this.authService.signOut(true);
    sessionStorage.clear();
    window.localStorage.clear();
    this.loggedIn = false;
    this.signInWithGoogle();
  }

  signOutFirst(): void {
    this.authService.signOut(true);
    sessionStorage.clear();
    window.localStorage.clear();
    this.loggedIn = false;
    window.location.reload();
  }

  addToLocalStorage(user){
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  getUserFromStorage(){
    this.users = JSON.parse(localStorage.getItem('users'));
    this.user = this.users[this.users.length - 1];
    this.loggedIn = true;
  }

  dropdown(){
    this.visible = !this.visible
  }

  toggleSetting(){
    this.toggle_setting = !this.toggle_setting;
    console.log(this.authService.authState)
  }

  toggleModal(){
    this.toggle_modal = !this.toggle_modal
  }

  toggleUser(){
    this.toggle_user = !this.toggle_user
  }

}
