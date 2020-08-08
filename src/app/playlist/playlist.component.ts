import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  id: number;
  toggle_title: boolean;
  toggle_desc: boolean;
  toggle_more: boolean;
  toggle_privacy: boolean;
  toggle_sort: boolean;

  playlist: any;
  detail: any;
  user: any;
  video: any;

  title: string;
  privacy: string;
  description: string;

  constructor(private data: DataService, private activatedRoute: ActivatedRoute, private apollo: Apollo) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => { 
      this.id = parseInt(params.get('id'));
    });
    console.log(this.id);

    this.toggle_desc = false;
    this.toggle_title = false;
    this.toggle_more = false;
    this.toggle_privacy = false;
    this.toggle_sort = false;

    this.getPlaylist();
    this.getDetail();
  }

  test(){
    console.log(this.title + this.description + this.privacy)
  }

  toggleTitle(){
    this.toggle_title = !this.toggle_title;
  }

  toggleMore(){
    this.toggle_more = !this.toggle_more;
  }

  toggleDesc(){
    this.toggle_desc = !this.toggle_desc;
  }

  togglePrivacy(){
    this.toggle_privacy = !this.toggle_privacy;
  }

  toggleSort(){
    this.toggle_sort = !this.toggle_sort;
  }

  getPlaylist(){
    this.apollo.query({
      query: gql`
        query getPlaylistId($id: Int!){
          getPlaylistId(playlistid: $id){
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
      this.playlist = result.data.getPlaylistId;
      this.title = this.playlist[0].name;
      this.description = this.playlist[0].description;
      this.privacy = this.playlist[0].privacy;
      this.getUser(this.playlist);
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getDetail(){
    this.apollo.query({
      query: gql`
        query getDetail($id: Int!){
          getPlaylistVideo(playlistid: $id){
            id,
            playlist_id,
            video_id
          }
        }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result => {
      this.detail = result.data.getPlaylistVideo
      this.getVideo(this.detail[0].video_id);
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

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
        id: temp[0].user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getVideo(id: number){
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
            visibility
          }
        }
      `,
      variables:{
        id: id
      }
    }).subscribe(result => {
      this.video = result.data.getVideoId;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  update(){
    this.apollo.mutate({
      mutation: gql`
      mutation updatePlaylist($id: Int!, $title: String!, $privacy: String!, $description: String!){
        updatePlaylist(id: $id, title: $title, privacy: $privacy, description: $description){
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
        id: this.id,
        title: this.title,
        privacy: this.privacy,
        description: this.description
      }
    }).subscribe(({ data }) => {
      new alert("update success");
      window.location.reload();
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  delete(){
    this.apollo.mutate({
      mutation: gql`
        mutation removePlaylist($id: Int!){
          deletePlaylist(id: $id)
        }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(({ data }) => {
      new alert("delete success");
      window.location.reload();
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  updateTitle(){
    this.title = (<HTMLInputElement>document.getElementById("title")).value;
    this.update();
  }

  updatePrivacyPublic(){
    this.privacy = "Public"
    this.update();
  }

  updatePrivacyPrivate(){
    this.privacy = "Private"
    this.update();
  }

  updateDescription(){
    this.description = (<HTMLInputElement>document.getElementById("description")).value
    this.update();
  }
}
