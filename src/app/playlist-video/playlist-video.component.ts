import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag'
import { DataService } from '../data.service';


@Component({
  selector: 'app-playlist-video',
  templateUrl: './playlist-video.component.html',
  styleUrls: ['./playlist-video.component.scss']
})
export class PlaylistVideoComponent implements OnInit {
  @Input() detailVideo
  @Input() playlist

  videos: any;
  videosid: number;
  videosname: string;
  user: any;
  thumbnail: string;
  toggle_etc:boolean;
  duration: string;
  calculate_day: string;
  toggle_self: boolean = false;
  description: string;
  toggle_premium: boolean = false;
  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    console.log(this.playlist);
    if(this.playlist[0].user_id == this.data.user_id){
      this.toggle_self = true;
    }
    console.log(this.detailVideo);
    this.toggle_etc = false;
    this.getVideo();
    
  }
  

  toggleEtc(){
    this.toggle_etc = !this.toggle_etc;
  }

  href(id: number){
    var target = "/video/" + id.toString();
    window.location.href=target;
  }

  getVideo(){
    this.apollo.query({
      query: gql `
        query getVideoById($id: Int!){
          getVideoId(videoid: $id){
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
        id: this.detailVideo.video_id
      }
    }).subscribe(result => {
      this.videos = result.data.getVideoId;
      this.videosid = this.videos.id;
      this.thumbnail = this.videos.thumbnail;
      this.videosname = this.videos.name;
      this.description = this.videos.description;
      var startDate = new Date(Date.UTC(this.videos.year, this.videos.month, this.videos.day, this.videos.hour, this.videos.minute, this.videos.second));
      var d = new Date();
      var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
      if(this.videos.premium == "premium"){
        this.toggle_premium = true;
      }
      this.calculate_day = this.calculateDay(startDate, endDate);
      this.calculateDuration();
      this.getUser(this.videos)
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  toUser(){
    window.location.href="channel/"+this.user.id
  }

  name: string;

  getUser(temp: any){
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
        id: temp.user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.name = this.user.name;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  deleteDetail(){
    this.apollo.mutate({
      mutation: gql`
      mutation deleteDetail($playlistid: Int!, $videoid: Int!){
        deleteDetailPlaylistVideo(playlistid: $playlistid, videoid: $videoid)
      }
      `,
      variables:{
        playlistid: this.detailVideo.playlist_id,
        videoid: this.detailVideo.video_id
      }
    }).subscribe(({data})=>{
      console.log(data);
    })
  }

  calculateDuration(){
    var second: number = this.videos.duration;
    var minute: number = 0;
    var hour: number = 0;

    var strSecond: string, strMinute : string, strHour: string;

    if(second > 0){
      while(second >= 60){
        minute++;
        second -= 60;
      }
      if(second < 10){
        strSecond = "0"+ second.toString();
      } else {
        strSecond = second.toString();
      }
    }

    if(minute > 0){
      while(minute >= 60){
        hour++;
        minute -= 60
      }
      if(minute < 10){
        strMinute = "0"+ minute.toString();
      } else {
        strMinute = minute.toString();
      }
    } else {
      this.duration = "00:" + strSecond;
      return;
    }

    if(hour > 0){
      if(hour < 10){
        strHour = "0"+ hour.toString();
      } else {
        strHour = hour.toString();
      }
      this.duration = strHour+":"+ strMinute +":"+ strSecond;
    } else {
      this.duration = strMinute +":"+ strSecond;
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
}

