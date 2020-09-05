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
  show_date: string;
  videos: any;

  totalWatch: number = 0;

  name: string;
  photo: string;
  description: string;
  header: string;
  membership: string;

  section: string;
  toggle_share: boolean= false;
  toggle_edit: boolean = false;
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

  toggleEdit(){
    this.toggle_edit = !this.toggle_edit;
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
      this.show_date = this.date.getDate()+ "/" +this.date.getMonth()+"/"+this.date.getFullYear()
      this.name = this.user.name;
      this.header = this.user.header;
      this.photo = this.user.photo;
      this.description = this.user.description;
      this.membership = this.user.membership;
      this.getVideo();
    })
  }

  getVideo(){
    this.apollo.query({
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
          year,
          hour,
          minute,
          second
        }
      }
      `,variables:{
        userid: this.user.id
      }
    }).subscribe(result => {
      this.videos = result.data.getVideoByUser;
      this.videos.forEach(element => {
        this.totalWatch += element.watch;
      });
    })
  }

  uploadDescription(){
    this.apollo.mutate({
      mutation: gql`
      mutation updateUser(
          $id: String!, 
          $name: String!, 
          $photo: String!, 
          $description: String!,
          $header: String!,
          $membership: String!,
        ){
        updateUser(id: $id, input:{
          name: $name,
          photo: $photo,
          membership: $membership,
          description: $description,
          header: $header,
          subscriber:0,
          views:0,
          id:"",
        }){
          id
        }
      }
      `,variables:{
        id: this.id,
        name: this.name,
        photo: this.photo,
        description: (<HTMLTextAreaElement>document.getElementById('description')).value,
        header: this.header,
        membership: this.membership
      }
    }).subscribe((data)=>{
      console.log(data);
    })
  }

}
