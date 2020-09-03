import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-modal-share',
  templateUrl: './modal-share.component.html',
  styleUrls: ['./modal-share.component.scss']
})
export class ModalShareComponent implements OnInit {
  @Input() videos;
  @Input() section;
  
  url: string;
  toggle_share: boolean = true;
  
  constructor() { }

  ngOnInit(): void {
    console.log(this.section);
    if(this.section == "video"){
      this.url = "http://localhost:4200/video/"+this.videos.id;
    } else if(this.section == "playlist"){
      this.url = "http://localhost:4200/playlist/"+this.videos;
    } else if(this.section == "channel"){
      this.url = "http://localhost:4200/channel/"+this.videos;
    }
  }

  toggleShare(){
    this.toggle_share = false;
  }

  copyMessage(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

}
