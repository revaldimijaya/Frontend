import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service';
import gql from 'graphql-tag';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.component.html',
  styleUrls: ['./premium.component.scss'],
  animations: [
    trigger(
      'fade', 
      [
        transition(
          ':enter', 
          [
            style({opacity: 0 }),
            animate('1000ms ease-out', 
                    style({opacity: 1 }))
            
          ]
        ),
        transition(
          ':leave', 
          [
            style({opacity: 1 }),
            animate('1000ms ease-in', 
                    style({opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class PremiumComponent implements OnInit {

  id: string;
  user: any;
  memberships: any;

  toggle_premium: boolean;
  isMonth: boolean;
  date1 : Date;
  strDate: string="";
  date2 : Date;
  history: string[]=[];

  constructor(private apollo: Apollo, private data: DataService) { }

  ngOnInit(): void {
    this.id = this.data.user_id.toString();
    console.log(this.id);
    if(this.id == ""){
      window.location.href="/";
      return;
    }
    this.getUser();
  }

  getUser(){
    this.apollo.query({
      query: gql`
      query getOne($id: String!){
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
      `,variables:{
        id: this.id
      }
    }).subscribe(result =>{
      this.user = result.data.getUserId
      if(this.user.membership.toLowerCase() == "yes"){
        this.toggle_premium = true;
      } else {
        this.toggle_premium = false;
      }
      this.getMembership();

    })
  }

  createMembershipMonth(){
    this.apollo.mutate({
      mutation: gql`
      mutation createMembership($id: String!){
        createMembership(userid: $id, type:"month"){
          id,
          created_at,
          end_at
        }
      }
      `,
      variables:{
        id:this.id
      }
    }).subscribe(({data})=>{
      console.log(data);
      this.isMonth = true;
      this.updateUserYes();
    })
  }

  createMembershipYear(){
    this.apollo.mutate({
      mutation: gql`
      mutation createMembership($id: String!){
        createMembership(userid: $id, type:"year"){
          id,
          created_at,
          end_at
        }
      }
      `,
      variables:{
        id:this.id
      }
    }).subscribe(({data})=>{
      console.log(data);
      this.isMonth = false;
      this.updateUserYes();
    })
  }

  getMembership(){
    this.apollo.query({
      query: gql`
      query getMembership($id: String!){
        getMembership(userid: $id){
          id,
          user_id,
          created_at,
          end_at,
          type
        }
      }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result =>{
      this.memberships = result.data.getMembership

      this.memberships.forEach(element => {
        var date = new Date(element.created_at);
        this.history.push(date.getDate().toString() +"-"+date.getMonth().toString() +"-"+date.getFullYear().toString()+" "+element.type);
      });

      if(this.memberships[this.memberships.length-1].type == "month"){
        this.isMonth = true;
      } else {
        this.isMonth = false;
      }

      this.date1 = new Date(this.memberships[this.memberships.length-1].end_at);
      this.strDate = this.date1.getDate().toString() +"-"+this.date1.getMonth().toString() +"-"+this.date1.getFullYear().toString()
      var d = new Date();
      this.date2 = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
      console.log(this.date1, this.date2);
      if(this.date1 < this.date2){
        this.toggle_premium = false;
        this.updateUserNo()
      }
    })
  }

  updateUserNo(){
    this.apollo.mutate({
      mutation:gql`
      mutation updateUser($id: String!, $name: String!, $membership: String!, $photo: String!, $description: String!, $header: String!){
        updateUser(id: $id, input:{
          id:"asd", 
          name:$name, 
          membership:$membership, 
          photo:$photo", 
          description:$description, 
          header:$header, 
          subscriber:0, 
          views:0, 
        }){
          id,
          membership
        }
      }
      `,
      variables:{
        id: this.id,
        name: this.user.name,
        membership: "no",
        photo: this.user.photo,
        description: this.user.description,
        header: this.user.header
      }
    }).subscribe(({data})=>{
      console.log(data);
      window.location.reload();
    })
  }

  updateUserYes(){
    console.log("asd");
    console.log(this.user);
    this.apollo.mutate({
      mutation:gql`
      mutation updateUser($id: String!, $name: String!, $membership: String!, $photo: String!, $description: String!, $header: String!){
        updateUser(id: $id, input:{
          id: $id, 
          name: $name, 
          membership: $membership, 
          photo: $photo, 
          description: $description, 
          header: $header, 
          subscriber:0, 
          views:0, 
        }){
          id,
          membership
        }
      }
      `,
      variables:{
        id: this.id,
        name: this.user.name,
        membership: "yes",
        photo: this.user.photo,
        description: this.user.description,
        header: this.user.header
      }
    }).subscribe(({data})=>{
      console.log(data);
      window.location.reload();
    },(error) =>{
      console.log(error);
    })
  }

}
