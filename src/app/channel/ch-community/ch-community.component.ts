import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { DataService } from 'src/app/data.service';
import { ActivatedRoute } from '@angular/router';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { AngularFireUploadTask, AngularFireStorage } from 'angularfire2/storage';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-ch-community',
  templateUrl: './ch-community.component.html',
  styleUrls: ['./ch-community.component.scss']
})
export class ChCommunityComponent implements OnInit {

  id: string;
  photoURL: string;

  user: any;
  postings: any

  toggle_true: boolean;
  isChannel: boolean = false;

  thumbnails: File[] = [];
  thumbnailPercentage: Observable<number>;
  thumbnailSnapshot: Observable<any>;
  thumbnailTask: AngularFireUploadTask;
  thumbnailURL: string = "";
  thumbnail_path: any;

  constructor(private storage: AngularFireStorage, private db: AngularFirestore, private apollo: Apollo, private data: DataService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.parent.paramMap.subscribe(params => { 
      this.id = params.get('id'); 
    });
    if(this.id == this.data.user_id){
      this.isChannel = true;
    }
    this.photoURL = this.data.photoUrl.toString();
    this.getUser();
    this.getPosting();
    this.toggle_true = false;
  }

  toggleTrue(){
    this.toggle_true = true;
  }

  togglePost(){
    this.toggle_true = !this.toggle_true;
  }

  getUser(){
    this.apollo.query({
      query: gql`
      query getOne($id: String!){
        getUserId(userid: $id){
          id,
          name,
          membership,
          photo
        }
      }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result =>{
      this.user = result.data.getUserId
    })
  }

  getPosting(){
    this.apollo.query({
      query: gql`
      query getPosting($id: String!){
        getPosting(userid: $id){
          id,
          user_id,
          description,
          picture,
          created_at
        }
      }
      `,
      variables:{
        id: this.id
      }
    }).subscribe(result =>{
      this.postings = result.data.getPosting
    })
  }

  createPosting(){
    console.log(this.data.user_id);
    console.log((<HTMLInputElement>document.getElementById("comment")).value);
    console.log(this.thumbnailURL);
    
    this.apollo.mutate({
      mutation: gql`
      mutation createPosting($id: String!, $description: String!, $picture: String!){
        createPosting(user_id: $id, description: $description, picture: $picture){
          id,
          user_id,
          created_at,
          description
        }
      }
      `,
      variables:{
        id:this.data.user_id,
        description:(<HTMLInputElement>document.getElementById("comment")).value,
        picture: this.thumbnailURL
      }
    }).subscribe(({ data }) => {
      console.log(data.createPosting.id);
      this.createNotification(data.createPosting.id);
    },(error) => { 
      console.log('there was an error sending the query', error);
    });
  }

  createNotification(id: number){  
    this.apollo.mutate({
      mutation: gql`
      mutation createNotification($userid: String!, $type: String!, $typeid: Int!, $thumbnail: String!, $photo: String!, $description: String!){
        createNotification(input:{
          user_id: $userid,
          type: $type,
          type_id: $typeid,
          thumbnail: $thumbnail,
          photo: $photo,
          created_at:" ",
          description: $description
        }){
          id,
          user_id,
          type,
          type_id,
          thumbnail,
          photo,
          created_at,
          description
        }
      }
      `,
      variables:{
        userid: this.data.user_id,
        type: "post",
        typeid: id,
        thumbnail: this.thumbnailURL,
        photo: this.data.photoUrl,
        description:(<HTMLInputElement>document.getElementById("comment")).value,
      }
    }).subscribe(({data})=>{
      console.log(data);
      new alert("notification"+data);
    },(error) => {
      console.log('there was an error sending the query', error);
      new alert("notification gagal"+error);
    });
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

}
