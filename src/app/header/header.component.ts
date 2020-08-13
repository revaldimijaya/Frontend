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

  users = [];
  user: SocialUser;
  loggedIn: boolean;
  message: string;
  subscription: any;
  playlist: any;

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
    }
    this.data.user_id = this.user.id;
    this.data.photoUrl = this.user.photoUrl;
    this.toggle_sign = false;
    this.getSubscriber();
    this.getPlaylist();
    console.log(this.data.user_id);
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);

    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      this.addToLocalStorage(user);
      this.createUser(user);
      window.location.href = ' ';
    });

  }

  toggleSign(){
    this.toggle_sign = !this.toggle_sign;
  }

  toggleSearch(){
    this.toggle_search = !this.toggle_search
  }

  inputSearch(i){
    (<HTMLInputElement>document.getElementById("search")).value = i.name;
  }

  search(){
    window.location.href = "/search/"+(<HTMLInputElement>document.getElementById("search")).value;
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
    })
  }

  createUser(user: SocialUser): void {
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
          id: this.user.id,
          name: this.user.name,
          membership: 'no',
          photo: this.user.photoUrl,
          subscriber: 0,
          views: 0,
          description: "i'm new",
          header: "gs://tpa-web-71a78.appspot.com/101224snowywishmv2.jpg"
        }
    }).subscribe(({ data }) => {
      console.log('got data', data);
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getSubscriber(){
    this.apollo.watchQuery({
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
    }).valueChanges.subscribe(result =>{
      this.subscription = result.data.getSubscribeByUser
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
    window.location.href = ' ';
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
