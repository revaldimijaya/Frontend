import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service';
import gql from 'graphql-tag';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit {
  @Input() user
  check: any;
  change_subs: boolean;
  subscription: any;
  total_subs: number = 0;
  toggle_subs: boolean;

  video: any;
  totalVideo: number = 0;

  toggle_notif: boolean = false;
  
  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    this.getSubsrcibers();
    this.checkSubs();
    this.toggle_subs = true;
    this.change_subs = true;
    if(this.data.user_id == this.user.id){
      this.toggle_subs = false;
    }
    this.getVideoByUser();
    this.getNotif();
  }

  notifs: any;

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
        subscribeto: this.user.id
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
        if(i.subscribe_to == this.user.id){
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

  getVideoByUser(){
    this.apollo.query({
      query: gql`
      query getVideosByUser($userid: String!){
        getVideoByUser(userid: $userid){
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
        userid: this.user.id
      }
    }).subscribe(result =>{
      this.video = result.data.getVideoByUser;
      this.totalVideo = this.video.length;
    })
  }
}
