import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  @Input() notification
  date: Date;
  day: string;
  month: string;
  year: string;
  constructor(private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {
    this.date = new Date(this.notification.created_at);
    this.day = this.date.getDay().toString();
    this.month = this.date.getMonth().toString();
    this.year = this.date.getFullYear().toString();
  }

  href(){
    if(this.notification.type == "video"){
      window.location.href="video/"+this.notification.type_id;
    } else {
      window.location.href="channel/"+this.notification.user_id+"/community";
    }
  }



  

}
