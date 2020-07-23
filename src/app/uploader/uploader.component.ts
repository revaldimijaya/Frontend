import { Component, Input, OnInit } from '@angular/core';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { DataService } from '../data.service'
import gql from 'graphql-tag';

@Component({
  selector: 'uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements OnInit {
  
  toggle_upload: boolean;
  isHovering: boolean;
  isUploaded: boolean;
  thumbnail_path: any;
  date = new Date();

  files: File[] = [];
  thumbnails: File[] = [];
  
  percentage: Observable<number>;
  snapshot: Observable<any>;
  task: AngularFireUploadTask;
  downloadURL: Observable<string>;

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

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  toggleUpload() {
    this.toggle_upload = !this.toggle_upload;
  }

  onDrop(files: FileList) {
    console.log(files.item(0));
    this.files.push(files.item(0));
  }

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private apollo: Apollo, private data: DataService) { }
  
  ngOnInit(): void {
    this.isUploaded = false;
    this.user_id = this.data.user_id.toString();
    console.log(this.user_id);
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

    console.log(this.user_id);
    console.log(this.downloadURL);
    console.log(this.name);
    console.log(this.description);
    console.log(this.thumbnailURL);
    console.log(this.category);
    console.log(this.restriction);
    console.log(this.visibility);
    console.log(this.premium);

    this.insertVideo();
  }

  insertVideo(): void{
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
            $day: Int!,
            $month: Int!,
            $year: Int!
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
            day: $day,
            month: $month,
            year: $year
          }){
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
            day,
            month,
            year
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
        day: this.date.getDay(),
        month: this.date.getMonth()+1,
        year: this.date.getFullYear()
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.toggle_upload = false;
    },(error) => {
      console.log('there was an error sending the query', error);
    });
  }

}