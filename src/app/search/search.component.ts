import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { start } from 'repl';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  name: string;
  constraintDate: number = 10000;
  searchVideos: any;
  searchPlaylists: any;
  searchChannel: any;

  toggle_video: boolean = true;
  toggle_channel: boolean = true;
  toggle_playlist: boolean = true;
  toggle_filter: boolean = false;

  day_video: number[]=[];
  day_channel: number[]=[];
  day_playlist: number[]=[];

  user_premium: any;

  constructor(private activatedRoute: ActivatedRoute, private data: DataService, private apollo: Apollo) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => { 
      this.name = params.get('name'); 
    });
    console.log("name");
    // this.activatedRoute.paramMap.subscribe(params => {
    // })
    this.getSearchChannel();
    this.getSearchPlaylists();
    this.getUserPremium();
    
  }

  toggleFilter(){
    this.toggle_filter = !this.toggle_filter;
  }

  toggleVideo(){
    this.toggle_channel = false;
    this.toggle_playlist = false;
    this.toggle_video = true;
  }

  toggleChannel(){
    this.toggle_channel = true;
    this.toggle_playlist = false;
    this.toggle_video = false;
  }

  togglePlaylist(){
    this.toggle_channel = false;
    this.toggle_playlist = true;
    this.toggle_video = false;
  }

  toggleWeek(){
    this.constraintDate = 7;
  }

  toggleMonth(){
    this.constraintDate = 31;
  }

  toggleYear(){
    this.constraintDate = 365;
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

  getUserPremium(){
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
      this.user_premium = result.data.getUserId;
      this.getSearchVideo();
    })
  }

  getSearchVideo(){
    this.apollo.query({
      query: gql`
      query searchVideo($name: String!){
        searchVideo(name: $name){
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
        name: "%"+this.name+"%"
      }
    }).subscribe(result => {
      this.searchVideos = result.data.searchVideo
      if(this.data.user_id != "") {
        if(this.user_premium.membership == "no"){
          this.searchVideos = this.searchVideos.filter(vid => vid.premium == "regular")
        } 
        if(this.data.isRestriction){
          this.searchVideos = this.searchVideos.filter(vid => vid.restriction == "kids")
        }
      }
      this.searchVideos.forEach(element => {
        var startDate = new Date(Date.UTC(element.year, element.month, element.day, element.hour, element.minute, element.second));
        var d = new Date();
        var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
        this.day_video.push(this.calculateDay(startDate, endDate));
      });
    })
  }

  getSearchPlaylists(){
    this.apollo.query({
      query: gql`
      query searchPlaylists($name: String!){
        searchPlaylist(name:$name){
          id,
          name,
          description,
          second,
          minute,
          hour,
          day,
          month,
          year,
          privacy,
          user_id,
          views
        }
      }
      `,
      variables:{
        name: "%"+this.name+"%"
      }
    }).subscribe(result => {
      this.searchPlaylists = result.data.searchPlaylist;
      this.searchPlaylists.forEach(element => {
        var startDate = new Date(Date.UTC(element.year, element.month, element.day, element.hour, element.minute, element.second));
        var d = new Date();
        var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
        this.day_playlist.push(this.calculateDay(startDate, endDate));
      });
    })
  }

  getSearchChannel(){
    this.apollo.query({
      query: gql`
      query searchChannel($name: String!){
        searchChannel(name: $name){
          id,
          name,
          photo,
          membership,
          subscriber,
          created_at,
          views,
          description,
          header
        }
      }
      `,
      variables:{
        name: "%"+this.name+"%"
      }
    }).subscribe(result => {
      this.searchChannel = result.data.searchChannel
      this.searchChannel.forEach(element => { 
        var startDate = new Date(element.created_at);
        var d = new Date();
        var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
        console.log(this.calculateDay(startDate,endDate));
        this.day_channel.push(this.calculateDay(startDate, endDate));
      });
    })
  }

}
