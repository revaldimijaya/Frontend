import { Component, OnInit, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service'
import gql from 'graphql-tag';


@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private apollo: Apollo, private data: DataService) {
    
  }
  
  id: number;
  photoURL: string;
  videos: any;
  user: any;
  comment: any;
  nextVideos: any;

  toggle_comment: boolean;
  comment_description: string;
  date = new Date();

  dislike: any;
  like: any;
  toggle_thumb: string;

  subscription: any;
  toggle_subs: boolean;
  change_subs: boolean;
  total_subs: number;
  calculate_day: string;

  ngOnInit(): void { 
    this.activatedRoute.paramMap.subscribe(params => { 
      this.id = parseInt(params.get('id')); 
    });
    this.total_subs = 0;
    this.photoURL = this.data.photoUrl.toString();
    this.toggle_subs = true;
    this.change_subs = true;
    this.toggle_thumb = "none";
    this.watch();
    this.getVideos();
    
    this.totalDislike();
    this.totalLike();
  }

  toggleComment(){
    this.toggle_comment = !this.toggle_comment;
  }

  toggleTrue(){
    this.toggle_comment = true;
  }

  toggleThumb(toggle: string){
    this.toggle_thumb = toggle;
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

  calculateDay(d1:number, m1:number, y1:number, d2:number, m2:number, y2:number): string{
    var days = this.getDifference(d1,m1,y1,d2,m2,y2)
    console.log(days);
    var year = 0;
    var month = 0;
    var week = 0;
    if(days >= 365){
      while(days > 0){
        year++;
        days /= 365;
      }
      return year + " years ago"

    } else if (days >= 30){
      while(days > 30){
        month++;
        days /= 30;
      }
      return month + " months ago"

    } else if (days >= 7){
      while(days > 7){
        week++;
        days /= 7
      }
      return week + " weeks ago"
    } else {
      return days + " days ago"
    }
  }

  getVideos() {
    this.apollo.watchQuery({
      query: gql`
        query getVideoId($videoid: Int!){
          getVideoId(videoid: $videoid){
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
            year
          }
        }
      `, 
      variables:{
        videoid: this.id
      }
    }).valueChanges.subscribe(result => {
      this.videos = result.data.getVideoId;
      this.calculate_day = this.calculateDay(this.videos.day, this.videos.month, this.videos.year, this.date.getDay(), this.date.getMonth()+1, this.date.getFullYear())
      console.log(this.calculate_day);
      this.getUser();
      this.getNextVideo();
      this.getComment();
    }, (error) => {
      console.log(this.videos);
      console.log('there was an error sending the query', error);
    });
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
        id: this.videos.user_id
      }
    }).valueChanges.subscribe(result => {
      this.user = result.data.getUserId;
      this.checkSubs(this.user);
      this.getSubs(this.user);
      if(this.data.user_id == this.user.id){
        this.toggle_subs = false;
      }
      this.toggle_comment = false;
      
    })
  }

  getComment(){
    this.apollo.watchQuery({
      query: gql `
        query getComment($videoid: Int!){
          comment(videoid: $videoid){
            id,
            user_id,
            video_id,
            comment,
            like,
            dislike,
            day,
            month,
            year
          }
        }
      `,
      variables:{
        videoid: this.id
      }
    }).valueChanges.subscribe(result => {
      this.comment = result.data.comment;
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getNextVideo(){
    
    this.apollo.watchQuery({
      query: gql`
        query getNextVideo($videoid: Int!){
          getNextVideo(videoid: $videoid){
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
            year
          }
        }
      `, 
      variables:{
        videoid: this.id
      }
    }).valueChanges.subscribe(result => {
      this.nextVideos = result.data.getNextVideo;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  insertComment(){
    this.comment_description = (<HTMLInputElement>document.getElementById("comment")).value;
    this.apollo.mutate({
      mutation: gql`
        mutation insertComment($user_id: String!, $video_id: Int!, $comment: String!, $like: Int!, $dislike: Int!, $day: Int!, $month: Int!, $year: Int!){
          createComment(input:{
            user_id: $user_id,
            video_id: $video_id,
            comment: $comment,
            like: $like,
            dislike: $dislike,
            day: $day,
            month: $month,
            year: $year
          }){
            user_id,
            video_id
          }
        }
      `,
      variables:{
        user_id: this.data.user_id,
        video_id: this.id,
        comment: this.comment_description,
        like: 0,
        dislike: 0,
        day: this.date.getDay(),
        month: this.date.getMonth()+1,
        year: this.date.getFullYear(),
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      // this.toggle_upload = false;
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  watch(){
    this.apollo.mutate({
      mutation: gql`
        mutation watch($id: Int!){
          watch(id: $id)
        }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(({ data }) => {
      console.log("view ++")
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }


  likeVideo(){
    this.apollo.mutate({
      mutation: gql`
        mutation videoLike($id: Int!, $user_id: String! , $type: String!){
          videoLike(id: $id, userid: $user_id, type: $type)
        }
      `,
      variables:{
        id: this.id,
        user_id: this.data.user_id,
        type: "like"
      }
    }).subscribe(({ data }) => {
      
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }


  dislikeVideo(){
    this.apollo.mutate({
      mutation: gql`
        mutation videoLike($id: Int!, $user_id: String! , $type: String!){
          videoLike(id: $id, userid: $user_id, type: $type)
        }
      `,
      variables:{
        id: this.id,
        user_id: this.data.user_id,
        type: "dislike"
      }
    }).subscribe(({ data }) => {
      console.log("dislike ++")
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  totalLike(){
    this.apollo.query({
      query: gql`
        query getVideoLike($videoid: Int!, $type: String!){
          getVideoLike(videoid:$videoid, type:$type){
            id,
            video_id,
            user_id
          }
        }
      `,
      variables:{
        videoid: this.id,
        type: "like"
      }
    }).subscribe(result => {
      this.like = result.data.getVideoLike;
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
        query getVideoLike($videoid: Int!, $type: String!){
          getVideoLike(videoid:$videoid, type:$type){
            id,
            video_id,
            user_id
          }
        }
      `,
      variables:{
        videoid: this.id,
        type: "dislike"
        
      }
    }).subscribe(result => {
      this.dislike = result.data.getVideoLike;
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

  getSubs(users: any){
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
        if(i.subscribe_to == users.id){
          this.total_subs += 1;
        }
      }
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  check: any;

  checkSubs(users: any){
    console.log(users);
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
        subscribeto:users.id,
        userid:this.data.user_id 
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
