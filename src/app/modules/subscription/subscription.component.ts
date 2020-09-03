import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from 'src/app/data.service';
import gql from 'graphql-tag';
import { windowTime } from 'rxjs/operators';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  subscription: any;
  videos: any;
  day: number[] = [];
  userid: string;
  user:any;

  lastIdx: number;
  observer: IntersectionObserver;

  constructor(private apollo:Apollo, private data:DataService) { }

  ngOnInit(): void {
    this.userid = "";
    
    if(this.data.logged_in == false){
      window.location.href=' ';
    }
    this.apollo.query({
      query: gql`
        query getSubscribeByUser($id: String!){
          getSubscribeByUser(userid: $id){
            id,
            user_id,
            subscribe_to,
          }
        }
      `,
      variables:{
        id: this.data.user_id
      }
    }).subscribe(result =>{
      this.subscription = result.data.getSubscribeByUser;
      this.subscription.forEach((element,index) => {
        this.userid += element.subscribe_to;
        if(index != this.subscription.length - 1){
          this.userid += ",";
        }
      });
      console.log(this.userid);
      this.getUser();
    })
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
        id: this.data.user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.getSubscribe();
    })
  }

  getSubscribe(){
    this.lastIdx = 4;
    this.apollo.query({
      query: gql`
      query getSubscribeVideo($userid: String!){
        getSubscribeVideo(userid: $userid){
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
        userid: this.userid
      }
    }).subscribe(result =>{
      this.videos = result.data.getSubscribeVideo
      if(this.data.user_id != "") {
        if(this.user.membership == "no"){
          this.videos = this.videos.filter(vid => vid.premium == "regular")
        } 
        if(this.data.isRestriction){
          this.videos = this.videos.filter(vid => vid.restriction == "kids")
        }
      }
      this.videos.forEach((element,index) => {
        var startDate = new Date(Date.UTC(element.year, element.month, element.day, element.hour, element.minute, element.second));
        var d = new Date();
        var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
        console.log(this.calculateDay(startDate, endDate));
        this.day.push(this.calculateDay(startDate, endDate));
      });
      
      // this.observer = new IntersectionObserver((entry)=>{
      //   if(entry[0].isIntersecting){
      //     let container = document.querySelector(".container");
      //     for(let i = 0 ; i < 4 ; i++){
            
      //       if(this.lastIdx < this.videos.length){
              
      //         let div = document.createElement("div");
      //         let video = document.createElement("app-card");
      //         video.setAttribute("videos","videos[this.lastIdx]");
      //         div.appendChild(video);
      //         container.appendChild(div);
      //         this.lastIdx++;
      //       }
      //     }
      //   }
      // });
      // this.observer.observe(document.querySelector('.footer'));
      // console.log(this.day);
      
    })
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

  calculateDay(startDate: Date, endDate: Date): number{
    return this.getDifference(startDate.getDate(),startDate.getMonth(),startDate.getFullYear(),endDate.getDate(),endDate.getMonth(),endDate.getFullYear())
  }

}
