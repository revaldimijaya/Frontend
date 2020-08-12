import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { SubscriptionComponent } from './modules/subscription/subscription.component';
import { TrendingComponent } from './modules/trending/trending.component';
import { LibraryComponent } from './modules/library/library.component';
import { LaterComponent } from './modules/later/later.component';
import { HistoryComponent } from './modules/history/history.component';
import { UploaderComponent } from './uploader/uploader.component'
import { VideosComponent } from './videos/videos.component'
import { EntertainmentComponent } from './category/entertainment/entertainment.component';
import { ChannelComponent } from './channel/channel.component'
import { PlaylistComponent } from './playlist/playlist.component'
import { ChHomeComponent } from './channel/ch-home/ch-home.component'
import { ChVideoComponent } from './channel/ch-video/ch-video.component';
import { TestingComponent } from './testing/testing.component';
import { ChPlaylistComponent } from './channel/ch-playlist/ch-playlist.component';
import { ChCommunityComponent } from './channel/ch-community/ch-community.component';
import { ChAboutComponent } from './channel/ch-about/ch-about.component';

const routes: Routes = [
  { path: '',component: HomeComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'trending', component: TrendingComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'later', component: LaterComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'upload', component: UploaderComponent },
  { path: 'video/:id', component: VideosComponent },
  { path: 'category/:category', component: EntertainmentComponent },
  {
    path: 'channel/:id', component: ChannelComponent,
    children: [
      {path :'', component: ChHomeComponent},
      {path: 'video', component: ChVideoComponent},
      {path: 'playlist', component: ChPlaylistComponent},
      {path: 'community', component: ChCommunityComponent},
      {path: 'about', component: ChAboutComponent}
    ]
  },
  { path: 'playlist/:id', component: PlaylistComponent},
  { path: 'testing', component: TestingComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }