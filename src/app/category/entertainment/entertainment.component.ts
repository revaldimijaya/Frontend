import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-entertainment',
  templateUrl: './entertainment.component.html',
  styleUrls: ['./entertainment.component.scss']
})
export class EntertainmentComponent implements OnInit {
  
  videos: any;
  category: string;
  constructor(private apollo: Apollo, private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(params => { 
      this.category = params.get('category'); 
    });

    this.apollo.watchQuery({
      query: gql`
        query getCategory($category: String!){
          getCategory(category: $category){
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
          }
        }
      `,
      variables:{
        category: this.category
      }
    }).valueChanges.subscribe(result =>{
      this.videos = result.data.getCategory;
      console.log(this.videos);
    })
  }

}
