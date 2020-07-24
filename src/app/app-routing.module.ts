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
  { path: 'channel/:id', component: ChannelComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }