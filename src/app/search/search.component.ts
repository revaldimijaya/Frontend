import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  name: string;
  searchVideos: any;
  searchPlaylists: any;
  searchChannel: any;

  constructor(private activatedRoute: ActivatedRoute, private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => { 
      this.name = params.get('name'); 
    });
    console.log("name");
    this.getSearchChannel();
    this.getSearchPlaylists();
    this.getSearchVideo();
  }

  getSearchVideo(){
    this.apollo.query({
      query: gql`
      query searchVideo($name: String!){
        searchVideo(name: $name){
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
        name: "%"+this.name+"%"
      }
    }).subscribe(result => {
      this.searchVideos = result.data.searchVideo
    })
  }

  getSearchPlaylists(){
    this.apollo.query({
      query: gql`
      query searchPlaylists($name: String!){
        searchPlaylist(name:$name){
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
        name: "%"+this.name+"%"
      }
    }).subscribe(result => {
      this.searchPlaylists = result.data.searchPlaylist
    })
  }

  getSearchChannel(){
    this.apollo.query({
      query: gql`
      query searchChannel($name: String!){
        searchChannel(name: $name){
          id,
          name,
          photo,
          membership,
          subscriber,
          created_at,
          views,
          description,
          header
        }
      }
      `,
      variables:{
        name: "%"+this.name+"%"
      }
    }).subscribe(result => {
      this.searchChannel = result.data.searchChannel
    })
  }

}
