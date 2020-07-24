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

  users = [];
  user: SocialUser;
  loggedIn: boolean;
  message: string;
  subscription: any;
  constructor(private authService: SocialAuthService, private apollo: Apollo, private data: DataService ) { }

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

  createUser(user: SocialUser): void {
    this.apollo.mutate({
      mutation: gql `
        mutation createUser($id: String!, $name: String!, $membership: String!, $photo: String!, $subscriber: Int!) {
          createUser(input:{id:$id, name:$name, membership:$membership, photo:$photo, subscriber:$subscriber}){
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
    this.getSubscriber();
  }

  addToLocalStorage(user){
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  getUserFromStorage(){
    this.users = JSON.parse(localStorage.getItem('users'));
    this.user = this.users[0];
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
