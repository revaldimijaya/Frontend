import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from 'src/app/data.service';
import gql from 'graphql-tag';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  constructor(private apollo:Apollo, private data:DataService) { }

  ngOnInit(): void {
    this.apollo.watchQuery({
      query: gql`
        query getSubscribe{
          getSubscribe{
            id,
            user_id,
            subscribe_to
          }
        }
      `
    })
  }

}
