import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { start } from 'repl';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() videos

  user: any;
  calculate_day: string;
  date = new Date();
  views: string;

  constructor(private apollo: Apollo) { }
  ngOnInit(): void {
    var startDate = new Date(Date.UTC(this.videos.year, this.videos.month, this.videos.day, this.videos.hour, this.videos.minute, this.videos.second));
    var d = new Date();
    var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));

    this.calculate_day = this.calculateDay(startDate, endDate);

    if(this.videos.watch >= 1000000000){
      this.views = (Math.round(((this.videos.watch / 1000000000) + Number.EPSILON) * 10) / 10) + "M";
    } else if(this.videos.watch >= 1000000){
      this.views = (Math.round(((this.videos.watch / 1000000) + Number.EPSILON) * 10) / 10) + "M";
    } else if(this.videos.watch >= 1000){
      this.views = Math.round(((this.videos.watch / 1000) + Number.EPSILON) * 10) / 10 + "K";
    } else {
      this.views = this.videos.watch;
    }

    this.apollo.watchQuery({
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
        id: this.videos.user_id
      }
    }).valueChanges.subscribe(result => {
      this.user = result.data.getUserId;
    })
  }

  monthDays:number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  countLeapYears(month:number, year:number): number{
    var years = year;

    if(month <= 2){
      years--;
    }

    return years/4 - years/100 + years/400;
  }

  getDifference(d1:number, m1:number, y1:number, d2:number, m2:number, y2:number): number{
    var n1 = y1*365 + d1

    for(let i = 0; i < m1 - 1 ; i++){
      n1 += this.monthDays[i];
    }

    n1 += this.countLeapYears(m1, y1)

    var n2 = y2*365 + d2
    for( let i = 0 ; i < m2 - 1 ; i++){
      n2 += this.monthDays[i];
    }

    n2 += this.countLeapYears(m2, y2)

    return (n2 - n1);
  }

  calculateDay(startDate: Date, endDate: Date): string{
    var days = this.getDifference(startDate.getDate(),startDate.getMonth(),startDate.getFullYear(),endDate.getDate(),endDate.getMonth(),endDate.getFullYear())
    var year = 0;
    var month = 0;
    var week = 0;
    if(days >= 365){
      while(days >= 365){
        year++;
        days -= 365;
      }
      return year + " years ago"

    } else if (days >= 30){
      while(days >= 30){
        month++;
        days -= 30;
      }
      return month + " months ago"

    } else if (days >= 7){
      while(days >= 7){
        week++;
        days -= 7;
      }
      return week + " weeks ago"
    } else {
      if(days == 0){
        this.calculateSecond(startDate, endDate);
      }
      return days + " days ago"
    }
  }

  calculateSecond(startDate: Date, endDate: Date): string{
    var diff = (endDate.getTime() - startDate.getTime()) / 1000;

    var date = diff / (60 * 60);
    date = Math.abs(Math.round(date));
    if(date > 0) return date + " hours ago";

    date = diff / 60;
    date = Math.abs(Math.round(date));
    if(date > 0) return date + " minutes ago";

    return diff + " seconds ago";
  }

}
