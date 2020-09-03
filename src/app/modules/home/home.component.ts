import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag'
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  videos: any[]=[];
  user: any;
  tempId: any;
  tempVideos:any[]=[];


  lastIdx: number;
  observer: IntersectionObserver;

  constructor(private apollo: Apollo, private router: Router, private data:DataService) { }

  ngOnInit(): void {
    this.lastIdx = 8;
    if(this.data.user_id != ""){
      this.getUser();
    } else {
      this.getVideos();
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
            subscriber
          }
        }
      `,
      variables:{
        id: this.data.user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.getVideos();
    })
  }

  getVideos(){
    this.apollo.query({
      query: gql`
        {
          videos{
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
            duration,
          }
        }
      `,
    }).subscribe(result => {
      this.videos = this.shuffle(result.data.videos);
      console.log(this.data.user_id);
      if(this.data.user_id != "") {
        if(this.user.membership == "no"){
          this.videos = this.videos.filter(vid => vid.premium == "regular")
        } 
        if(this.data.isRestriction){
          this.videos = this.videos.filter(vid => vid.restriction == "kids")
        }
      }
      this.observer = new IntersectionObserver((entry)=>{
        if(entry[0].isIntersecting){
          let container = document.querySelector(".container");
          for(let i = 0 ; i < 4 ; i++){
            
            if(this.lastIdx < this.videos.length){
              
              let div = document.createElement("div");
              let video = document.createElement("app-card");
              video.setAttribute("videos","videos[this.lastIdx]");
              div.appendChild(video);
              container.appendChild(div);
              this.lastIdx++;
            }
          }
        }
      });
      this.observer.observe(document.querySelector('.footer'));
    });
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
