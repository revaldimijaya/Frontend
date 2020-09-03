import { Component, OnInit, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service'
import gql from 'graphql-tag';


@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit {

  constructor(private router: Router ,private activatedRoute: ActivatedRoute, private apollo: Apollo, private data: DataService) {
    
  }
  
  id: number;
  photoURL: string;
  videos: any;
  user: any;
  comment: any;
  nextVideos: any;
  video: any;

  toggle_comment: boolean;
  comment_description: string;
  date = new Date();

  dislike: any;
  like: any;
  toggle_thumb: string;
  bools: boolean = false;

  subscription: any;
  toggle_subs: boolean;
  change_subs: boolean;
  total_subs: number;
  calculate_day: string;
  toggle_modal: boolean;
  toggle_autoplay: boolean = false;
  toggle_video: boolean = false;
  toggle_download: boolean = false;
  toggle_share: boolean = false;
  toggle_newest: boolean = false;
  toggle_sort: boolean = false;
  section: string;

  lastIdx: number;
  lastIdx2: number;
  observer: IntersectionObserver;
  observer2: IntersectionObserver;

  ngOnInit(): void { 
    this.activatedRoute.paramMap.subscribe(params => { 
      this.id = parseInt(params.get('id')); 
    });
    this.total_subs = 0;
    this.photoURL = this.data.photoUrl.toString();
    this.toggle_subs = true;
    this.change_subs = true;
    this.toggle_modal = false;
    this.section = "video";
    this.toggle_thumb = "none";
    this.getUserPremium();
    this.activatedRoute.paramMap.subscribe(params => {
      this.watch();
      this.getVideos();
      this.getComment();
      this.totalDislike();
      this.totalLike();
      this.auto();
    })
    document.onkeyup = (e) => {
      let vid = (<HTMLVideoElement>document.getElementById('mat-video').querySelector('video'))
      e.preventDefault()
      if(this.toggle_video){
        if(e.keyCode == 74){
          vid.currentTime -= 10
        }
        else if(e.keyCode == 75){
          vid.paused ? vid.play() : vid.pause()
        }
        else if(e.keyCode == 76){
          vid.currentTime += 10
        }
        else if(e.keyCode == 70){
          vid.requestFullscreen();
        }
        else if(e.keyCode == 38){
          if(vid.volume < 1)
            vid.volume += 0.2
        }
        else if(e.keyCode == 40){
          if(vid.volume > 0)
            vid.volume -= 0.2
          
        }
      }
    }
  }

  toggleSort(){
    this.toggle_sort = !this.toggle_sort;
  }

  toggleNewest(){
    this.toggle_newest = true;
    this.comment.sort((a,b) => {return b.id - a.id});
    // this.getComment();

  }

  toggleShare(){
    this.toggle_share = !this.toggle_share;
  }

  toggleVideo(){
    this.toggle_video = !this.toggle_video;
  }

  toggleAutoplay(){
    this.toggle_autoplay = !this.toggle_autoplay;
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

  toggleModal(){
    this.toggle_modal = !this.toggle_modal
  }

  autoplay:boolean = false;

  auto(){
    var auto = (<HTMLVideoElement>document.getElementById('mat-video').querySelector('video'))
    console.log(auto);
    auto.onended = () => {
      console.log(this.toggle_autoplay);
      if(this.toggle_autoplay)
        this.router.navigate(["video/"+this.nextVideos[0].id]);
    }
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

  getVideos() {
    this.apollo.query<any>({
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
            year,
            hour,
            minute,
            second
          }
        }
      `, 
      variables:{
        videoid: this.id
      }
    }).subscribe(result => {
      this.videos = result.data.getVideoId;
      
      console.log(this.videos)
      var startDate = new Date(Date.UTC(this.videos.year, this.videos.month, this.videos.day, this.videos.hour, this.videos.minute, this.videos.second));
      var d = new Date();
      var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
      this.calculate_day = this.calculateDay(startDate, endDate);
      this.getUser();
      this.getNextVideo();
      
    }, (error) => {
      console.log(this.videos);
      console.log('there was an error sending the query', error);
    });
  }

  videoTemp: any[]=[];

  getUser(){
    this.apollo.query<any>({
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
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.checkSubs(this.user);
      this.getSubs(this.user);
      if(this.data.user_id == this.user.id){
        this.toggle_subs = false;
      }
      this.toggle_comment = false;
      
    })
  }

  getUserPremium(){
    if(this.data.user_id == ""){
      return;
    }
    this.apollo.query<any>({
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
        id: this.data.user_id
      }
    }).subscribe(result => {
      if(result.data.getUserId.membership == "yes"){
        this.toggle_download = true;
      }
      
    })
  }

  compareDesc(a,b){
    let comparasion = 0;
    if(a.id > b.id){
      comparasion = 1;
    } else {
      comparasion = -1;
    }
    return comparasion;
  }

  getComment(){
    this.comment=[];
    this.lastIdx2 = 3;
    this.apollo.query<any>({
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
            year,
            hour,
            minute,
            second
          }
        }
      `,
      variables:{
        videoid: this.id
      }
    }).subscribe(result => {
      this.comment = result.data.comment;
      if(this.toggle_newest){
        
        console.log(this.comment);
      }
      this.observer2 = new IntersectionObserver((entry)=>{
        if(entry[0].isIntersecting){
          let container = document.querySelector(".user-container");
          for(let i = 0 ; i < 4; i++){
            
            if(this.lastIdx2 < this.comment.length){
              let div = document.createElement("div");
              let video = document.createElement("app-comment");
              video.setAttribute("comments","comments[this.lastIdx2]");
              div.appendChild(video);
              container.appendChild(div);
              this.lastIdx2++;
            }
          }
        }
      });
      this.observer2.observe(document.querySelector('.footer2'));
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getNextVideo(){
    this.lastIdx = 4;
    this.apollo.query<any>({
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
            year,
            hour,
            minute,
            second,
            duration
          }
        }
      `, 
      variables:{
        videoid: this.id
      }
    }).subscribe(result => {
      this.nextVideos = this.shuffle(result.data.getNextVideo);

      this.observer = new IntersectionObserver((entry)=>{
        if(entry[0].isIntersecting){
          let container = document.querySelector(".next-video");
          for(let i = 0 ; i < 4; i++){
            
            if(this.lastIdx < this.nextVideos.length){
              let div = document.createElement("div");
              let video = document.createElement("app-next-video");
              video.setAttribute("nextVideo","nextVideo[this.lastIdx]");
              div.appendChild(video);
              container.appendChild(div);
              this.lastIdx++;
            }
          }
        }
      });
      this.observer.observe(document.querySelector('.footer'));
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  insertComment(){
    this.comment_description = (<HTMLInputElement>document.getElementById("comment")).value;
    this.apollo.mutate<any>({
      mutation: gql`
        mutation insertComment($user_id: String!, $video_id: Int!, $comment: String!, $like: Int!, $dislike: Int!){
          createComment(input:{
            user_id: $user_id,
            video_id: $video_id,
            comment: $comment,
            like: $like,
            dislike: $dislike,
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
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      // this.toggle_upload = false;
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  watch(){
    this.apollo.mutate<any>({
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
    this.apollo.mutate<any>({
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
    this.apollo.mutate<any>({
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
    this.apollo.query<any>({
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
    this.apollo.query<any>({
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
    this.apollo.mutate<any>({
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
    this.apollo.query<any>({
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
    this.apollo.query<any>({
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

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

  
}
