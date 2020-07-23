import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-next-video',
  templateUrl: './next-video.component.html',
  styleUrls: ['./next-video.component.scss']
})
export class NextVideoComponent implements OnInit {
  @Input() nextVideo;

  user: any;
  calculate_day: string;
  date = new Date();
  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.getUser();
    this.calculate_day = this.calculateDay(this.nextVideo.day, this.nextVideo.month, this.nextVideo.year, this.date.getDay(), this.date.getMonth()+1, this.date.getFullYear())
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

  calculateDay(d1:number, m1:number, y1:number, d2:number, m2:number, y2:number): string{
    var days = this.getDifference(d1,m1,y1,d2,m2,y2)
    console.log(days);
    var year = 0;
    var month = 0;
    var week = 0;
    if(days >= 365){
      while(days > 0){
        year++;
        days /= 365;
      }
      return year + " years ago"

    } else if (days >= 30){
      while(days > 30){
        month++;
        days /= 30;
      }
      return month + " months ago"

    } else if (days >= 7){
      while(days > 7){
        week++;
        days /= 7
      }
      return week + " weeks ago"
    } else {
      return days + " days ago"
    }
  }

  getUser(){
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
        id: this.nextVideo.user_id
      }
    }).valueChanges.subscribe(result => {
      this.user = result.data.getUserId;
    })
  }

}
