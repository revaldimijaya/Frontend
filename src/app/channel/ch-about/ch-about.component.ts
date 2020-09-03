import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from 'src/app/data.service';
import { ActivatedRoute } from '@angular/router';
import gql from 'graphql-tag';

@Component({
  selector: 'app-ch-about',
  templateUrl: './ch-about.component.html',
  styleUrls: ['./ch-about.component.scss']
})
export class ChAboutComponent implements OnInit {

  id: string;
  user: any;
  date: Date;

  section: string;
  toggle_share: boolean= false;
  constructor(private apollo:Apollo, private data:DataService, private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.parent.paramMap.subscribe(params => { 
      this.id = params.get('id'); 
    });
    this.section = "channel";
    this.getUser();
  }

  toggleShare(){
    this.toggle_share = !this.toggle_share;
  }

  getUser(){
    this.apollo.query({
      query: gql`
      query getOne($id: String!) {
        getUserId(userid: $id){
          id,
          name,
          membership,
          photo,
          created_at,
          views,
          description,
          header,
        }
      }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result =>{
      this.user = result.data.getUserId
      this.date = new Date(this.user.created_at);
    })
  }

}
