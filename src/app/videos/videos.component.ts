import { Component, OnInit } from '@angular/core';
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

  ngOnInit(): void { 
    this.activatedRoute.paramMap.subscribe(params => { 
      this.id = parseInt(params.get('id')); 
    });
    
    this.photoURL = this.data.photoUrl.toString();
    console.log(this.id);
    this.getVideos();
    this.toggle_comment = false;
  }

  toggleComment(){
    this.toggle_comment = !this.toggle_comment;
  }

  toggleTrue(){
    this.toggle_comment = true;
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
      this.getUser();
      this.getNextVideo();
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
      this.getComment();
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
            dislike
          }
        }
      `,
      variables:{
        videoid: this.id
      }
    }).valueChanges.subscribe(result => {
      this.comment = result.data.comment;
      
      console.log(this.comment);
    },(error) => {
      console.log(this.comment);
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
      console.log(this.nextVideos);
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
}
