import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from 'src/app/data.service';
import gql from 'graphql-tag';
import { windowTime } from 'rxjs/operators';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  subscription: any;
  videos: any;
  temp: any;
  constructor(private apollo:Apollo, private data:DataService) { }

  ngOnInit(): void {
    console.log(this.data.user_id);
    if(this.data.logged_in == false){
      window.location.href=' ';
    }
    this.apollo.query({
      query: gql`
        query getSubscribeByUser($id: String!){
          getSubscribeByUser(userid: $id){
            id,
            user_id,
            subscribe_to,
          }
        }
      `,
      variables:{
        id: this.data.user_id
      }
    }).subscribe(result =>{
      this.subscription = result.data.getSubscribeByUser;
      console.log(this.subscription);
    })
    
  }

}
