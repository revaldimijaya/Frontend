import { Component, OnInit, Input } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { start } from 'repl';
import { DataService } from '../data.service';
import { Observable } from 'rxjs';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() videos

  user: any;
  name: string;
  photo: string;
  playlists: any;

  calculate_day: string;
  date = new Date();
  views: string;
  duration: string;

  toggle_other: boolean;
  toggle_modal: boolean;
  toggle_create: boolean;
  toggle_login: boolean;
  toggle_premium: boolean = false;
  toggle_picture: boolean = false;
  isOwnChannel: boolean = false;
  toggle_thumbnail: boolean = false;

  edit_title: string;
  edit_description: string;
  edit_privacy: string;
  edit_thumbnail: string;

  thumbnailPercentage: Observable<number>
  thumbnailSnapshot: Observable<any>;
  thumbnailTask: AngularFireUploadTask;
  thumbnailURL: Observable<string>;
  
  thumbnail_path: any;

  thumbnails: File[] = [];

  constructor(private apollo: Apollo, private data: DataService, private storage: AngularFireStorage) { }

  ngOnInit(): void {
    if(this.data.user_id == ""){
      this.toggle_login = false;
    } else {
      this.toggle_login = true;
    }
    console.log(this.data.isOwnChannel);
    if(this.data.isOwnChannel == true){
      this.isOwnChannel = true;
    } else {
      this.isOwnChannel = false;
    }

    if(this.videos.premium == "premium"){
      this.toggle_premium = true;
    }

    var startDate = new Date(Date.UTC(this.videos.year, this.videos.month, this.videos.day, this.videos.hour, this.videos.minute, this.videos.second));
    var d = new Date();
    var endDate = new Date(Date.UTC(d.getFullYear(), d.getMonth()+1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));

    this.calculate_day = this.calculateDay(startDate, endDate);
    this.calculateDuration();
    this.toggle_other = false;
    this.toggle_modal = false;
    this.toggle_create = false;
    if(this.videos.watch >= 1000000000){
      this.views = (Math.round(((this.videos.watch / 1000000000) + Number.EPSILON) * 10) / 10) + "B";
    } else if(this.videos.watch >= 1000000){
      this.views = (Math.round(((this.videos.watch / 1000000) + Number.EPSILON) * 10) / 10) + "M";
    } else if(this.videos.watch >= 1000){
      this.views = Math.round(((this.videos.watch / 1000) + Number.EPSILON) * 10) / 10 + "K";
    } else {
      this.views = this.videos.watch;
    }

    this.getPlaylist();

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
        id: this.videos.user_id
      }
    }).subscribe(result => {
      this.user = result.data.getUserId;
      this.name = this.user.name;
      this.photo = this.user.photo;
    })
  }

  toUser(){
    window.location.href="channel/"+this.user.id;
  }

  toggleEditThumbnail(){
    this.toggle_thumbnail = !this.toggle_thumbnail;
  }

  togglePublic(){
    this.edit_privacy = "public";
  }

  togglePrivate(){
    this.edit_privacy = "private";
  }

  togglePicture(){
    this.toggle_picture = !this.toggle_picture;
    if(this.toggle_picture){
      console.log((<HTMLInputElement>document.getElementById('edit-title')));
      this.edit_title = this.videos.name;
      this.edit_description = this.videos.description;
      this.edit_thumbnail = this.videos.thumbnail;
      this.edit_privacy = this.videos.visibility;
    }
  }

  toggleOther(){
    this.toggle_other = !this.toggle_other;
  }

  toggleModal(){
    this.toggle_modal = !this.toggle_modal;
  }

  toggleCreate(){
    this.toggle_create = !this.toggle_create;
  }

  updateVideo(){
    this.edit_title = (<HTMLInputElement>document.getElementById('edit-title')).value;
    this.edit_description = (<HTMLInputElement>document.getElementById('edit-description')).value;
    if(this.toggle_thumbnail == true && this.thumbnailURL != undefined){
      this.edit_thumbnail = this.thumbnailURL.toString();
    }
    console.log(this.edit_title, this.edit_description, this.toggle_thumbnail, this.edit_privacy);

    this.apollo.mutate({
      mutation: gql`
      mutation updateVideo(
        $id: Int!,
        $url: String!,
        $name: String!,
        $description: String!,
        $thumbnail: String!,
        $visibility: String!
      ){
        updateVideo(id: $id, input:{
          user_id:"",
          url: $url,
          watch:0,
          like:0,
          dislike:0,
          restriction:"",
          location:"",
          name: $name,
          premium:"",
          category:"",
          thumbnail: $thumbnail,
          description: $description,
          visibility: $visibility,
          duration:0,
        }){
          id
        }
      }
      `,
      variables:{
        id: this.videos.id,
        url: this.edit_thumbnail,
        name: this.edit_title,
        description: this.edit_description,
        thumbnail: this.edit_thumbnail,
        visibility: this.edit_privacy
      }
    }).subscribe((data) => {
      console.log(data);
    })
  }

  deleteVideo(){
    this.apollo.mutate({
      mutation: gql`
      mutation deleteVideo($id: Int!) {
        deleteVideo(id: $id)
      }
      `,
      variables:{
        id: this.videos.id
      }
    }).subscribe((data) => {
      console.log(data);
    })
  }

  getPlaylist(){
    this.apollo.query({
      query: gql`
        query getPlaylistByUser($id: String!){
          getPlaylistUser(userid: $id){
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
        id: this.data.user_id
      }
    }).subscribe(result =>{
      this.playlists = result.data.getPlaylistUser;
    })
  }

  createPlaylist(){
    this.apollo.mutate({
      mutation: gql `
        mutation createPlaylist($name: String!, $description: String!, $privacy: String!, $userid: String!, $views: Int!){
          createPlaylist(input:{
            name: $name
            description: $description
            privacy: $privacy
            user_id: $userid
            views: $views
          }){
            name
          }
        }
      `,
      variables:{
        name: (<HTMLInputElement>document.getElementById("title")).value,
        description: "",
        privacy: (<HTMLSelectElement>document.getElementById("privacy")).value,
        userid: this.data.user_id,
        views: 0,
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  calculateDuration(){
    var second: number = this.videos.duration;
    var minute: number = 0;
    var hour: number = 0;

    var strSecond: string, strMinute : string, strHour: string;

    if(second > 0){
      while(second >= 60){
        minute++;
        second -= 60;
      }
      if(second < 10){
        strSecond = "0"+ second.toString();
      } else {
        strSecond = second.toString();
      }
    }

    if(minute > 0){
      while(minute >= 60){
        hour++;
        minute -= 60
      }
      if(minute < 10){
        strMinute = "0"+ minute.toString();
      } else {
        strMinute = minute.toString();
      }
    } else {
      this.duration = "00:" + strSecond;
      return;
    }

    if(hour > 0){
      if(hour < 10){
        strHour = "0"+ hour.toString();
      } else {
        strHour = hour.toString();
      }
      this.duration = strHour+":"+ strMinute +":"+ strSecond;
    } else {
      this.duration = strMinute +":"+ strSecond;
    }
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
      if(days <= 0){
        var diff = (endDate.getTime() - startDate.getTime()) / 1000;

        var date = diff / (60 * 60);
        date = Math.abs(Math.round(date));
        if(date > 0) return date + " hours ago";
    
        date = diff / 60;
        date = Math.abs(Math.round(date));
        if(date > 0) return date + " minutes ago";
    
        return diff + " seconds ago";
      }
      return days + " days ago"
    }
  }

  startUploadThumbnail(files : FileList){
    const path = files.item(0).name;
    console.log(path)
  
    const ref = this.storage.ref(path);

    this.thumbnailTask = this.storage.upload(path, files.item(0));
    
    this.thumbnailPercentage = this.thumbnailTask.percentageChanges();
    
    this.thumbnailTask.then(async upload => await ref.getDownloadURL().subscribe(url => {this.thumbnailURL = url}));
  }
}
