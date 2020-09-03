import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { windowTime } from 'rxjs/operators';
import gql from 'graphql-tag';
import { DataService } from '../data.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { StringValueNode } from 'graphql';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss'],
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
export class ChannelComponent implements OnInit {
  
  id: string;
  user: any;
  name: string;
  header: string;
  photo: string;

  subscription: any;
  total_subs: number;
  toggle_subs: boolean;
  change_subs: boolean;
  toggle_home : boolean = false;
  toggle_videos : boolean = false;
  toggle_playlists : boolean = false;
  toggle_community : boolean = false;
  toggle_about : boolean = false;

  constructor(private router: Router,private apollo: Apollo, private activatedRoute: ActivatedRoute, private data: DataService) { }

  ngOnInit(): void {
    this.total_subs = 0;
    this.activatedRoute.paramMap.subscribe(params => { 
      this.id = params.get('id'); 
    });
    this.getUser();
    this.getSubsrcibers();
    this.checkSubs();
    this.toggle_subs = true;
    this.change_subs = true;
    if(this.data.user_id == this.id){
      this.toggle_subs = false;
    }
    
    var hr = this.router.url.split("/");
    console.log(hr);
    if(hr.length == 3){
      this.toggle_home = true;
    } else if(hr[3] == "video"){
      this.toggle_videos = true;
    } else if(hr[3] == "playlist"){
      this.toggle_playlists = true;
    } else if(hr[3] == "community"){
      this.toggle_community = true;
    } else {
      this.toggle_about = true;
    }

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
            created_at,
            views,
            description,
            header,
          }
        }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.name = this.user.name;
      this.header = this.user.header;
      this.photo = this.user.photo;
      
    },(error) => {
      console.log('there was an error sending the query', error);
      window.location.href = ' ';
    });
  }

  getSubsrcibers(){
    this.apollo.query({
      query: gql`
        query getSubscribe{
          getSubscribe{
            id,
            user_id,
            subscribe_to
          }
        }
      `
    }).subscribe(result => {
      this.subscription = result.data.getSubscribe;
      for(let i of this.subscription){
        console.log(this.id);
        console.log(this.subscription);
        if(i.subscribe_to == this.id){
          this.total_subs += 1;
        }
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
        subscribeto: this.id
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

}
