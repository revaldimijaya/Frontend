import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-entertainment',
  templateUrl: './entertainment.component.html',
  styleUrls: ['./entertainment.component.scss']
})
export class EntertainmentComponent implements OnInit {
  
  videos: any;
  category: string;
  day: number[]=[];
  user:any;
  constructor(private apollo: Apollo, private activatedRoute:ActivatedRoute, private data:DataService) { }

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(params => { 
      this.category = params.get('category'); 
    });

    if(this.data.user_id == ""){
      return;
    }
    this.apollo.query<any>({
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
        id: this.data.user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.getVideo();
    })

    
  }

  getVideo(){
    this.apollo.query({
      query: gql`
        query getCategory($category: String!){
          getCategory(category: $category){
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
            second,
            duration
          }
        }
      `,
      variables:{
        category: this.category
      }
    }).subscribe(result =>{
      this.videos = result.data.getCategory;
      if(this.data.user_id != "") {
        if(this.user.membership == "no"){
          this.videos = this.videos.filter(vid => vid.premium == "regular")
        } 
        if(this.data.isRestriction){
          this.videos = this.videos.filter(vid => vid.restriction == "kids")
        }
      }
      this.videos.forEach((element,index) => {
          var startDate = new Date(Date.UTC(element.year, element.month, element.day, element.hour, element.minute, element.second));
          var d = new Date();
          var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
          console.log(this.calculateDay(startDate, endDate));
          this.day.push(this.calculateDay(startDate, endDate));
          console.log(this.videos);
        
      })
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

  calculateDay(startDate: Date, endDate: Date): number{
    return this.getDifference(startDate.getDate(),startDate.getMonth(),startDate.getFullYear(),endDate.getDate(),endDate.getMonth(),endDate.getFullYear())
  }

  
}
