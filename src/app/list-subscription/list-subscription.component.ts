import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-list-subscription',
  templateUrl: './list-subscription.component.html',
  styleUrls: ['./list-subscription.component.scss']
})
export class ListSubscriptionComponent implements OnInit {
  @Input() subscription;

  user: any;
  id: string;
  photo: string;
  name: string;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(){
    this.apollo.query({
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
        id: this.subscription.subscribe_to
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.id = this.user.id;
      this.photo = this.user.photo;
      this.name = this.user.name;
    })
  }

}
