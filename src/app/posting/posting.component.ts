import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-posting',
  templateUrl: './posting.component.html',
  styleUrls: ['./posting.component.scss']
})
export class PostingComponent implements OnInit {
  @Input() post

  id: string;
  user: any;

  dislike: any;
  like: any;
  toggle_thumb: string;
  calculate_day: string;

  constructor(private data:DataService, private apollo:Apollo) { }

  ngOnInit(): void {
    var startDate = new Date(this.post.created_at);
    var d = new Date();
    var endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
    console.log(startDate, endDate);
    this.calculate_day = this.calculateDay(startDate, endDate);
    this.getUser();
    this.totalDislike();
    this.totalLike();
    this.toggle_thumb = "none";
  }

  monthDays:number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  countLeapYears(month:number, year:number): number{
    var years = year;

    if(month <= 2){
      years--;
    }

    return years/4 - years/100 + years/400;
  }

  getDifference(d1:number, m1:number, y1:number, d2:number, m2:number, y2:number): number{
    var n1 = y1*365 + d1

    for(let i = 0; i < m1 - 1 ; i++){
      n1 += this.monthDays[i];
    }

    n1 += this.countLeapYears(m1, y1)

    var n2 = y2*365 + d2
    for( let i = 0 ; i < m2 - 1 ; i++){
      n2 += this.monthDays[i];
    }

    n2 += this.countLeapYears(m2, y2)

    return (n2 - n1);
  }

  calculateDay(startDate: Date, endDate: Date): string{
    var days = this.getDifference(startDate.getDate(),startDate.getMonth(),startDate.getFullYear(),endDate.getDate(),endDate.getMonth(),endDate.getFullYear())
    var year = 0;
    var month = 0;
    var week = 0;
    if(days >= 365){
      while(days >= 365){
        year++;
        days -= 365;
      }
      return year + " years ago"

    } else if (days >= 30){
      while(days >= 30){
        month++;
        days -= 30;
      }
      return month + " months ago"

    } else if (days >= 7){
      while(days >= 7){
        week++;
        days -= 7;
      }
      return week + " weeks ago"
    } else {
      if(days <= 0){
        var diff = (endDate.getTime() - startDate.getTime()) / 1000;

        var date = diff / (60 * 60);
        date = Math.abs(Math.round(date));
        if(date > 0) return date + " hours ago";
    
        date = diff / 60;
        date = Math.abs(Math.round(date));
        if(date > 0) return date + " minutes ago";
    
        return diff + " seconds ago";
      }
      return days + " days ago"
    }
  }
  getUser(){
    this.apollo.watchQuery({
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
        id: this.post.user_id
      }
    }).valueChanges.subscribe(result => {
      this.user = result.data.getUserId;
    })
  }

  likePosting(){
    this.apollo.mutate({
      mutation: gql`
      mutation likePosting($id: Int!, $userid: String!, $type: String!){
        postingLike(id: $id, userid: $userid, type: $type)
      }
      `,
      variables:{
        id: this.post.id,
        userid: this.data.user_id,
        type: "like"
      }
    }).subscribe(({ data }) => {
      
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }


  dislikePosting(){
    this.apollo.mutate({
      mutation: gql`
      mutation likePosting($id: Int!, $userid: String!, $type: String!){
        postingLike(id: $id, userid: $userid, type: $type)
      }
      `,
      variables:{
        id: this.post.id,
        userid: this.data.user_id,
        type: "dislike"
      }
    }).subscribe(({ data }) => {
      
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  totalLike(){
    this.apollo.query({
      query: gql`
      query getPostingLike($id: Int!, $type: String!){
        getPostingLike(postingid: $id, type: $type){
          id,
          posting_id,
          user_id,
          type
        }
      }
      `,
      variables:{
        id: this.post.id,
        type: "like"
      }
    }).subscribe(result => {
      this.like = result.data.getPostingLike;
      for(let i of this.like){
        if(i.user_id == this.data.user_id){
          this.toggle_thumb = "like"
        }
      }
    }, (error) => {
      console.log(this.like);
      console.log('there was an error sending the query', error);
    });
  }

  totalDislike(){
    this.apollo.query({
      query: gql`
      query getPostingLike($id: Int!, $type: String!){
        getPostingLike(postingid: $id, type: $type){
          id,
          posting_id,
          user_id,
          type
        }
      }
      `,
      variables:{
        id: this.post.id,
        type: "dislike"
        
      }
    }).subscribe(result => {
      this.dislike = result.data.getPostingLike;
      for(let i of this.dislike){
        if(i.user_id == this.data.user_id){
          this.toggle_thumb = "dislike"
        }
      }
    }, (error) => {
      console.log(this.dislike);
      console.log('there was an error sending the query', error);
    });
  }
}
