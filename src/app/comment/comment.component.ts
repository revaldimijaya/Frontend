import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { DataService } from '../data.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comments

  reply: any;
  user: any;
  photoURL: string;
  toggle_comment: boolean;
  date = new Date();
  comment_date: string;

  like: any;
  dislike: any;
  toggle_thumb: string;
  toggle_show: boolean = true;
  toggle_showAll: boolean = false;
  replyLen: number = 0;
  is_exist: boolean = false;

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    this.toggle_comment = false;
    this.photoURL = this.data.photoUrl.toString();
    console.log(this.comments);
    var startDate = new Date(Date.UTC(this.comments.year, this.comments.month, this.comments.day, this.comments.hour, this.comments.minute, this.comments.second));
    var d = new Date();
    var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
    this.comment_date = this.calculateDay(startDate, endDate);
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
        id: this.comments.user_id
      }
    }).valueChanges.subscribe(result => {
      this.user = result.data.getUserId;
      this.getReply();
    })
  }

  toggleComment(){
    this.toggle_comment = !this.toggle_comment;
  }

  toggleShowAll(){
    this.toggle_showAll = !this.toggle_showAll;
    this.toggle_show = !this.toggle_show;
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

  getReply(){
    this.apollo.watchQuery({
      query: gql`
      query reply($commentid: Int!){
        reply(commentid: $commentid){
          id,
          user_id,
          comment_id,
          reply,
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
        commentid : this.comments.id
      }
    }).valueChanges.subscribe(result => {
      this.reply = result.data.reply;
      this.replyLen = this.reply.length;
      if(this.replyLen != 0){
        this.is_exist = true;
      }
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  insertReply(){
    this.apollo.mutate({
      mutation: gql`
      mutation createReply($user_id: String!, $comment_id: Int!, $reply: String!){
        createReply(input:{
          user_id: $user_id, 
          comment_id: $comment_id, 
          reply: $reply,
        }){
          id,
          user_id,
          comment_id,
          reply,
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
        user_id: this.data.user_id,
        comment_id: this.comments.id,
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

  likeComment(){
    this.apollo.mutate({
      mutation: gql`
        mutation commentLike($id: Int!, $user_id: String! , $type: String!){
          commentLike(id: $id, userid: $user_id, type: $type)
        }
      `,
      variables:{
        id: this.comments.id,
        user_id: this.data.user_id,
        type: "like"
      }
    }).subscribe(({ data }) => {
      
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  dislikeComment(){
    this.apollo.mutate({
      mutation: gql`
        mutation commentLike($id: Int!, $user_id: String! , $type: String!){
          commentLike(id: $id, userid: $user_id, type: $type)
        }
      `,
      variables:{
        id: this.comments.id,
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
        query getCommentLike($commentid: Int!, $type: String!){
          getCommentLike(commentid:$commentid, type:$type){
            id,
            user_id,
            type,
            comment_id
          }
        }
      `,
      variables:{
        commentid: this.comments.id,
        type: "like"
      }
    }).subscribe(result => {
      this.like = result.data.getCommentLike;
      console.log(this.like);
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
        query getCommentLike($commentid: Int!, $type: String!){
          getCommentLike(commentid:$commentid, type:$type){
            id,
            user_id,
            type,
            comment_id
          }
        }
      `,
      variables:{
        commentid: this.comments.id,
        type: "dislike"
      }
    }).subscribe(result => {
      this.dislike = result.data.getCommentLike;
      console.log(this.dislike);
      for(let i of this.dislike){
        if(i.user_id == this.data.user_id){
          this.toggle_thumb = "dislike"
        }
      }
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

}
