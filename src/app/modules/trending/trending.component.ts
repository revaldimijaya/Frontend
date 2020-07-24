import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { query } from '@angular/animations';
import gql from 'graphql-tag';

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.scss']
})
export class TrendingComponent implements OnInit {

  videos: any;

  constructor(private apollo: Apollo,) { }

  ngOnInit(): void {
    this.apollo.watchQuery({
     query: gql`
      query getVideoTrending{
        getVideoTrending{
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
     `
    }).valueChanges.subscribe(result =>{
      this.videos = result.data.getVideoTrending;
    })
  }

}
