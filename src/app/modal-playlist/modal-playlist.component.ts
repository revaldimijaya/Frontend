import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service';
import gql from 'graphql-tag';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal-playlist',
  templateUrl: './modal-playlist.component.html',
  styleUrls: ['./modal-playlist.component.scss'],
  animations: [
    trigger(
      'fade', 
      [
        transition(
          ':enter', 
          [
            style({opacity: 0 }),
            animate('500ms ease-out', 
                    style({opacity: 1 }))
            
          ]
        ),
        transition(
          ':leave', 
          [
            style({opacity: 1 }),
            animate('500ms ease-in', 
                    style({opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ModalPlaylistComponent implements OnInit {
  @Input() videos
  toggle_create: boolean = false;
  toggle_modal: boolean = true;
  playlists: any;

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    this.getPlaylist();
  }
  toggleCreate(){
    this.toggle_create = !this.toggle_create;
  }
  toggleModal(){
    this.toggle_modal = false;
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
        id: this.data.user_id
      }
    }).subscribe(result =>{
      this.playlists = result.data.getPlaylistUser;
    })
  }

  createPlaylist(){
    this.apollo.mutate({
      mutation: gql `
        mutation createPlaylist($name: String!, $description: String!, $privacy: String!, $userid: String!, $views: Int!){
          createPlaylist(input:{
            name: $name
            description: $description
            privacy: $privacy
            user_id: $userid
            views: $views
          }){
            name
          }
        }
      `,
      variables:{
        name: (<HTMLInputElement>document.getElementById("title")).value,
        description: "",
        privacy: (<HTMLSelectElement>document.getElementById("privacy")).value,
        userid: this.data.user_id,
        views: 0,
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

}
