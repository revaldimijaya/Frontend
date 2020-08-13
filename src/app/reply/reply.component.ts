import { Component, OnInit, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service';
import gql from 'graphql-tag';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit {
  @Input() replys;

  user: any;
  like: any;
  dislike: any;
  photoURL: string;
  reply_date: string;
  date = new Date();
  toggle_thumb: string;
  toggle_comment: boolean;

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    this.photoURL = this.data.photoUrl.toString();
    var startDate = new Date(Date.UTC(this.replys.year, this.replys.month, this.replys.day, this.replys.hour, this.replys.minute, this.replys.second));
    var d = new Date();
    var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
    this.reply_date = this.calculateDay(startDate, endDate);
    this.totalLike();
    this.totalDislike();
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
        id: this.replys.user_id
      }
    }).valueChanges.subscribe(result => {
      this.user = result.data.getUserId;
    })
  }

  toggleComment(){
    this.toggle_comment = !this.toggle_comment;
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

  likeReply(){
    this.apollo.mutate({
      mutation: gql`
        mutation replyLike($id: Int!, $user_id: String! , $type: String!){
          replyLike(id: $id, userid: $user_id, type: $type)
        }
      `,
      variables:{
        id: this.replys.id,
        user_id: this.data.user_id,
        type: "like"
      }
    }).subscribe(({ data }) => {
      
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  dislikeReply(){
    this.apollo.mutate({
      mutation: gql`
        mutation replyLike($id: Int!, $user_id: String! , $type: String!){
          replyLike(id: $id, userid: $user_id, type: $type)
        }
      `,
      variables:{
        id: this.replys.id,
        user_id: this.data.user_id,
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
        query getReplyLike($replyid: Int!, $type: String!){
          getReplyLike(replyid: $replyid, type:$type){
            id,
            user_id,
            type,
            reply_id
          }
        }
      `,
      variables:{
        replyid: this.replys.id,
        type: "like"
      }
    }).subscribe(result => {
      this.like = result.data.getReplyLike;
      
      for(let i of this.like){
        if(i.user_id == this.data.user_id){
          this.toggle_thumb = "like"
        }
      }
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  totalDislike(){
    this.apollo.query({
      query: gql`
        query getReplyLike($replyid: Int!, $type: String!){
          getReplyLike(replyid: $replyid, type:$type){
            id,
            user_id,
            type,
            reply_id
          }
        }
      `,
      variables:{
        replyid: this.replys.id,
        type: "dislike"
      }
    }).subscribe(result => {
      this.dislike = result.data.getReplyLike;
      
      for(let i of this.dislike){
        if(i.user_id == this.data.user_id){
          this.toggle_thumb = "dislike"
        }
      }
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  insertReply(){
    this.apollo.mutate({
      mutation: gql`
      mutation createReply($user_id: String!, $comment_id: Int!, $reply: String!, $day: Int!, $month: Int!, $year: Int!){
        createReply(input:{
          user_id: $user_id, 
          comment_id: $comment_id, 
          reply: $reply,
          day: $day,
          month: $month,
          year: $year,
        }){
          id,
          user_id,
          comment_id,
          reply,
          day,
          month,
          year
        }
      }
      `,
      variables:{
        user_id: this.data.user_id,
        comment_id: this.replys.comment_id,
        reply: (<HTMLInputElement>document.getElementById("reply")).value,
        day: this.date.getDay(),
        month: this.date.getMonth()+1,
        year: this.date.getFullYear()
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

}
