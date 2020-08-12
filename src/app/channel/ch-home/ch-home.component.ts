import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ActivatedRoute } from '@angular/router';
import gql from 'graphql-tag';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-ch-home',
  templateUrl: './ch-home.component.html',
  styleUrls: ['./ch-home.component.scss']
})
export class ChHomeComponent implements OnInit {

  id: string;
  videos: any;
  firstVideo: any[]=[];
  shuffleVideo: any;
  fiveVideo: any[]=[];
  
  playlists: any;
  shufflePlaylist: any;
  threePlaylists: any[]=[];
  
  isPrivate: boolean = false;

  constructor(private apollo: Apollo, private activatedRoute: ActivatedRoute, private data: DataService) { }

  ngOnInit(): void {
    
    this.activatedRoute.parent.paramMap.subscribe(params => { 
      this.id = params.get('id'); 
    });
    console.log(this.id);
    if(this.id == this.data.user_id){
      this.isPrivate = true; 
    }
    console.log(this.isPrivate);

    this.getVideoByUser();
    this.getPlaylist();
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
      this.firstVideo.push(this.videos[this.videos.length - 1]);
      this.shuffleVideo = this.shuffle(this.videos);
      var count = 0;
      this.shuffleVideo.forEach((element,index) => {
        if(count == 5 || this.isPrivate == false && element.visibility.toLowerCase() == "private"){
          console.log("private");
          return;
        }
        this.fiveVideo.push(element);
        count++;
      });
    })
  }

  getPlaylist(){
    this.apollo.query({
      query: gql`
      query getPlaylistByUser($id: String!){
        getPlaylistUser(userid: $id){
          id,
          name,
          description,
          second,
          minute,
          hour,
          day,
          month,
          year,
          privacy,
          user_id,
          views
        }
      }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result =>{
      this.playlists = result.data.getPlaylistUser;
      this.shufflePlaylist = this.shuffle(this.playlists);
      var count = 0;
      this.shufflePlaylist.forEach((element,index) => {
        if(count == 3 || this.isPrivate == false && element.privacy.toLowerCase() == "private"){
          console.log("private");
          return;
        }
        this.threePlaylists.push(element);
        count++;
      
      });
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
