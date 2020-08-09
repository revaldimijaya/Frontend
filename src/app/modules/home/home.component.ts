import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag'
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  videos: any;
  user: any;
  tempId: any;
  
  lastIdx: number;
  observer: IntersectionObserver;

  constructor(private apollo: Apollo, private router: Router) { }

  ngOnInit(): void {
    this.lastIdx = 8;

    this.apollo.watchQuery({
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
    }).valueChanges.subscribe(result => {
      this.videos = result.data.videos;

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

    console.log(this.videos)
    
    
  }

}
