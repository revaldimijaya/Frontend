import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-next-video',
  templateUrl: './next-video.component.html',
  styleUrls: ['./next-video.component.scss']
})
export class NextVideoComponent implements OnInit {
  @Input() nextVideo;

  user: any;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getUser();
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
        id: this.nextVideo.user_id
      }
    }).valueChanges.subscribe(result => {
      this.user = result.data.getUserId;
    })
  }

}
