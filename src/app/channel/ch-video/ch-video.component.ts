import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-ch-video',
  templateUrl: './ch-video.component.html',
  styleUrls: ['./ch-video.component.scss']
})
export class ChVideoComponent implements OnInit {

  id: string;
  isPrivate: boolean;
  videos: any;
  viewVideos: any[]=[];

  lastIdx: number;
  observer: IntersectionObserver;

  constructor(private apollo: Apollo, private activatedRoute: ActivatedRoute, private data: DataService) { }

  ngOnInit(): void {
    this.lastIdx = 4;
    this.activatedRoute.parent.paramMap.subscribe(params => { 
      this.id = params.get('id'); 
    });
    console.log(this.id);
    if(this.id == this.data.user_id){
      this.isPrivate = true; 
    }
    this.getVideoByUser();
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
          second,
          duration,
        }
      }
      `,
      variables:{
        userid: this.id
      }
    }).subscribe(result => {
      this.videos = result.data.getVideoByUser;
      this.videos.forEach(element => {
        if(this.isPrivate == false && element.visibility.toLowerCase() == "private"){
          console.log("private");
          return;
        }
        this.viewVideos.push(element);
      });

      this.observer = new IntersectionObserver((entry)=>{
        if(entry[0].isIntersecting){
          let container = document.querySelector(".container");
          for(let i = 0 ; i < 4 ; i++){
            
            if(this.lastIdx < this.viewVideos.length){
              
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
    })

  }

}
