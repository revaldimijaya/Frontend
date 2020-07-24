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

  constructor(private apollo:Apollo, private data:DataService) { }

  ngOnInit(): void {
    console.log(this.data.logged_in);
    if(this.data.logged_in == false){
      window.location.href=' ';
    }
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
    }).valueChanges.subscribe(result =>{
      
      for(let i of result.data.getSubscribe){
        if(i.user_id == this.data.user_id){
          this.subscription = result.data.getSubscribe;
        }
      }
      
    })
    
  }

  getVideo(temp: any){
    
   
  }

}
