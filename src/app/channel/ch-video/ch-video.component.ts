import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ActivatedRoute, Router } from '@angular/router';
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
  toggle_newest: boolean = false;
  toggle_oldest: boolean = false;
  toggle_view: boolean = false;
  toggle_sort: boolean = false;

  lastIdx: number;
  observer: IntersectionObserver;

  constructor(private apollo: Apollo, private activatedRoute: ActivatedRoute, private data: DataService, private router: Router) { }

  ngOnInit(): void {
    this.lastIdx = 4;
    this.activatedRoute.parent.paramMap.subscribe(params => { 
      this.id = params.get('id'); 
      this.getVideoByUser();
    });
    console.log(this.id);
    if(this.id == this.data.user_id){
      this.isPrivate = true; 
    }
  }

  toggleNewest(){
    this.toggle_newest = true;
    this.toggle_oldest = false;
    this.toggle_view = false;
    this.getVideoByUser();
  }

  toggleOldest(){
    this.toggle_newest = false;
    this.toggle_oldest = true;
    this.toggle_view = false;
    this.getVideoByUser();
  }

  toggleView(){
    this.toggle_newest = false;
    this.toggle_oldest = false;
    this.toggle_view = true;
    this.getVideoByUser();
  }

  toggleSort(){
    this.toggle_sort = !this.toggle_sort;
  }

  compareAsc(a,b){
    let comparasion = 0;
    if(a.id > b.id){
      comparasion = 1;
    } else if (a.id < b.id){
      comparasion = -1;
    }
    return comparasion;
  }

  compareDesc(a,b){
    let comparasion = 0;
    if(a.id < b.id){
      comparasion = 1;
    } else if (a.id > b.id){
      comparasion = -1;
    }
    return comparasion;
  }

  compareViews(a,b){
    let comparasion = 0;
    if(a.watch < b.watch){
      comparasion = 1;
    } else if (a.watch > b.watch){
      comparasion = -1;
    }
    return comparasion;
  }

  getVideoByUser(){
    this.viewVideos = [];
    this.videos = [];
    this.apollo.watchQuery({
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
    }).valueChanges.subscribe(result => {
      this.videos = result.data.getVideoByUser;
      if(this.toggle_newest){
        this.videos.sort(this.compareDesc);
      } else if(this.toggle_oldest){
        this.videos.sort(this.compareAsc);
      } else if(this.toggle_view){
        this.videos.sort(this.compareViews);
      }
      this.videos.forEach(element => {
        if(this.isPrivate == false && element.visibility.toLowerCase() == "private"){
          console.log("private");
          return;
        }
        this.viewVideos.push(element);
      });
      
      console.log(this.videos);

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
