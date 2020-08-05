import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ActivatedRoute } from '@angular/router';
import { windowTime } from 'rxjs/operators';
import gql from 'graphql-tag';
import { DataService } from '../data.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit {
  
  id: string;
  user: any;

  subscription: any;
  total_subs: number;
  toggle_subs: boolean;
  change_subs: boolean;

  constructor(private apollo: Apollo, private activatedRoute: ActivatedRoute, private data: DataService) { }

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
            subscriber
          }
        }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      
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
