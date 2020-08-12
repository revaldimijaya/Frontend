import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ch-playlist',
  templateUrl: './ch-playlist.component.html',
  styleUrls: ['./ch-playlist.component.scss']
})
export class ChPlaylistComponent implements OnInit {

  playlists: any;
  id: string;

  constructor(private apollo:Apollo, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.parent.paramMap.subscribe(params => { 
      this.id = params.get('id'); 
    });
    this.getPlaylist();
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
    })
  }

}
