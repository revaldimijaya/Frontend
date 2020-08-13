import { Component, Input, OnInit } from '@angular/core';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service'
import gql from 'graphql-tag';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  animations: [
    trigger(
      'fade', 
      [
        transition(
          ':enter', 
          [
            style({opacity: 0 }),
            animate('2000ms ease-out', 
                    style({opacity: 1 }))
            
          ]
        ),
        transition(
          ':leave', 
          [
            style({opacity: 1 }),
            animate('2000ms ease-in', 
                    style({opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class UploaderComponent implements OnInit {
  
  toggle_upload: boolean;
  toggle_playlist: boolean;
  isHovering: boolean;
  isUploaded: boolean;
  thumbnail_path: any;
  date = new Date();

  files: File[] = [];
  thumbnails: File[] = [];
  
  percentage: Observable<number>;
  snapshot: Observable<any>;
  task: AngularFireUploadTask;
  downloadURL: string;

  thumbnailPercentage: Observable<number>
  thumbnailSnapshot: Observable<any>;
  thumbnailTask: AngularFireUploadTask;
  thumbnailURL: Observable<string>;

  user_id: string;
  url: string;
  watch: number;
  like: number;
  dislike: number;
  restriction: string;
  location: string;
  name: string;
  premium: string;
  category: string;
  description: string;
  visibility: string;
  title: string;
  duration: number;
  toggle_title: boolean;
  toggle_addPlaylist: boolean = false;

  playlists: any;

  videos: any;
  lastId: number;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private apollo: Apollo, private data: DataService) { }
  
  ngOnInit(): void {
    this.isUploaded = false;
    this.toggle_title = false;
    this.toggle_playlist = false;
    this.user_id = this.data.user_id.toString();
    
    this.getVideos();
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  togglePlaylist(){
    this.toggle_playlist = !this.toggle_playlist;
  }

  toggleChange(){
    this.isUploaded = true;
  }

  toggleShowPlaylist(){
    this.getPlaylist();
    this.toggle_addPlaylist = true;
  }

  toggleUpload() {
    this.toggle_upload = !this.toggle_upload;
  }

  onDrop(files: FileList) {
    console.log(files.item(0));
    this.title = files.item(0).name;
    this.toggle_title = true;
    this.files.push(files.item(0));
  }

  getPlaylist(){
    this.apollo.watchQuery({
      query: gql`
        query getPlaylist($id: String!){
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
    }).valueChanges.subscribe(result => {
      this.playlists = result.data.getPlaylistUser;

      var sel = (<HTMLSelectElement>document.getElementById("myPlaylist"));
      var opt = (<HTMLOptionElement>document.createElement("option"));
      console.log(sel);
      opt.value = "0";
      opt.text = "None";
      sel.append(opt);
      for(let i of this.playlists){
        var sel = (<HTMLSelectElement>document.getElementById("myPlaylist"));
        var opt = (<HTMLOptionElement>document.createElement("option"))
        opt.value = i.id;
        opt.text = i.name;
        sel.append(opt);
      }
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  startUpload() {
    const path = this.files[0].name;
    console.log(path)
  
    const ref = this.storage.ref(path);

    this.task = this.storage.upload(path, this.files[0]);
    
    this.percentage = this.task.percentageChanges();

    this.snapshot   = this.task.snapshotChanges().pipe(
      tap(console.log),
      
      finalize( async() =>  {
        this.downloadURL = await ref.getDownloadURL().toPromise();

        this.db.collection('files').add( { downloadURL: this.downloadURL, path });
        this.isUploaded = true;
      }),
    );
  }

  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  thumbnailPath(files: FileList):void{
    console.log(files.item(0))
    var thumbnail = files.item(0);
    const reader = new FileReader();
    reader.onload = test => this.thumbnail_path = reader.result as string;

    reader.readAsDataURL(thumbnail)
    
  }

  startUploadThumbnail(files : FileList){
    const path = files.item(0).name;
    console.log(path)
  
    const ref = this.storage.ref(path);

    this.thumbnailTask = this.storage.upload(path, files.item(0));
    
    this.thumbnailPercentage = this.thumbnailTask.percentageChanges();
    
    this.thumbnailTask.then(async upload => await ref.getDownloadURL().subscribe(url => {this.thumbnailURL = url}));
  }

  check(){
    var myVid =<HTMLVideoElement>document.getElementById("myVideo");
    console.log(Math.floor(myVid.duration));
    console.log((<HTMLSelectElement>document.getElementById("myPlaylist")).value);
  }

  uploadVideo():void{
    this.name = (<HTMLInputElement>document.getElementById("title")).value;
    this.description = (<HTMLTextAreaElement>document.getElementById("description")).value;
    this.category = (<HTMLSelectElement>document.getElementById("category")).value;
    if((<HTMLInputElement>document.getElementById("restriction")).checked){
      this.restriction = "adult";
    } else {
      this.restriction = "kids";
    }

    if((<HTMLInputElement>document.getElementById("privacy")).checked){
      this.visibility = "public";
    } else {
      this.visibility = "private";
    }

    if((<HTMLInputElement>document.getElementById("membership")).checked){
      this.premium = "premium";
    } else {
      this.premium = "regular";
    }
    this.like = 0;
    this.dislike = 0;
    this.watch = 0;

    var myVid =<HTMLVideoElement>document.getElementById("myVideo");
    this.duration =Math.floor(myVid.duration);

    console.log(this.user_id);
    console.log(this.downloadURL);
    console.log(this.name);
    console.log(this.description);
    console.log(this.thumbnailURL);
    console.log(this.category);
    console.log(this.restriction);
    console.log(this.visibility);
    console.log(this.premium);
    console.log(this.duration);

    var pl = (<HTMLSelectElement>document.getElementById("myPlaylist")).value;
    this.insertVideo(Number(pl));
  }

  createDetail(playlistid: number, videoid: number){
    if(playlistid == 0){
      this.toggle_upload = false;
      window.location.reload();
      return;
    } 
    this.apollo.mutate({
      mutation: gql`
        mutation createDetail($playlistid: Int!, $videoid: Int!){
          createDetailPlaylist(playlistid: $playlistid, videoid: $videoid){
            id,
            playlist_id,
            video_id
          }
        }
      `,
      variables:{
        playlistid: playlistid,
        videoid: videoid
      }
    }).subscribe(({ data }) => {
      new alert("playlist masuk"+data);
      this.toggle_upload = false;
      window.location.reload();
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  insertVideo(playlistid: number): void{
    this.apollo.mutate({
      mutation: gql`
        mutation insertVideo(
            $user_id: String!, 
            $url: String!,
            $watch: Int!,
            $like: Int!,
            $dislike: Int!,
            $restriction: String!,
            $location: String!,
            $name: String!,
            $thumbnail: String!,
            $premium: String!,
            $category: String!,
            $description: String!,
            $visibility: String!,
            $duration: Int!
          ){
          createVideo(input:{
            user_id: $user_id, 
            url: $url, 
            watch: $watch, 
            like: $like, 
            dislike: $dislike, 
            restriction: $restriction, 
            location: $location, 
            name: $name,
            thumbnail: $thumbnail,
            premium: $premium,
            category: $category,
            description: $description,
            visibility: $visibility
            duration: $duration
          }){
            id,
            user_id,
            url,
            watch,
            like,
            dislike,
            restriction,
            location,
            name,
            thumbnail,
            premium,
            category,
            description,
            visibility,
            duration
          }
        }
      `,
      variables:{
        user_id: this.user_id,
        url: this.downloadURL,
        watch: this.watch,
        like: this.like,
        dislike: this.dislike,
        restriction: this.restriction,
        location: "Indonesia",
        name: this.name,
        thumbnail: this.thumbnailURL,
        premium: this.premium,
        category: this.category,
        description: this.description,
        visibility: this.visibility,
        duration: this.duration
      }
    }).subscribe(({ data }) => {
      console.log('got data', data.createVideo.id);
      this.createDetail(playlistid, data.createVideo.id);
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  getVideos() {
    this.apollo.query({
      query: gql`
        query {
          videos{
            id
          }
        }
      `
    }).subscribe(result => {
      this.videos = result.data.videos;
      console.log(this.videos[this.videos.length-1]);
      this.lastId = Number(this.videos[this.videos.length-1].id) + 1;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  createPlaylist(){
    var privacy: string;
    if((<HTMLInputElement>document.getElementById("privacy-playlist")).checked){
      privacy = "public";
    } else {
      privacy = "private";
    }
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
        name: (<HTMLInputElement>document.getElementById("title-playlist")).value,
        description: "",
        privacy: privacy,
        userid: this.data.user_id,
        views: 0,
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

  copyMessage(){
    this.check();
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = "http://localhost:4200/video/"+this.lastId;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}