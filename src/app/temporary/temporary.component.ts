import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-temporary',
  templateUrl: './temporary.component.html',
  styleUrls: ['./temporary.component.scss']
})
export class TemporaryComponent implements OnInit {
  @Input() user;
  
  videos: any;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
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
            year
          }
        }
      `,
      variables:{
        userid: this.user.subscribe_to
      }
    }).valueChanges.subscribe(result => {
      this.videos = result.data.getVideoByUser
      console.log(this.videos);
    })
  }

}
