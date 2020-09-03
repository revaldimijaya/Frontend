import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { SocialAuthService } from "angularx-social-login";

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { environment } from '../environments/environment';
import { DropzoneDirective } from './drop-zone.directive'

import { AppRoutingModule} from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component'
import { HomeComponent } from './modules/home/home.component';
import { SubscriptionComponent } from './modules/subscription/subscription.component';
import { TrendingComponent } from './modules/trending/trending.component';
import { LibraryComponent } from './modules/library/library.component';
import { HistoryComponent } from './modules/history/history.component';
import { LaterComponent } from './modules/later/later.component';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { UploaderComponent } from './uploader/uploader.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatVideoModule } from 'mat-video';
import { CardComponent } from './card/card.component';
import { VideosComponent } from './videos/videos.component'
import { CommentComponent } from './comment/comment.component'
import { NextVideoComponent } from './next-video/next-video.component'
import { ReplyComponent } from './reply/reply.component'
import { HorizontalVideoComponent } from './horizontal-video/horizontal-video.component'
import { EntertainmentComponent } from './category/entertainment/entertainment.component'
import { ListSubscriptionComponent } from './list-subscription/list-subscription.component'
import { PlaylistComponent } from './playlist/playlist.component'
import { PlaylistVideoComponent } from './playlist-video/playlist-video.component'
import { PlaylistListComponent } from './playlist-list/playlist-list.component'
import { PlaylistSidebarComponent } from './playlist-sidebar/playlist-sidebar.component'
import { ModalPlaylistComponent } from './modal-playlist/modal-playlist.component';
import { ChHomeComponent } from './channel/ch-home/ch-home.component';
import { ChVideoComponent } from './channel/ch-video/ch-video.component';
import { TestingComponent } from './testing/testing.component'
import { ChannelComponent } from './channel/channel.component';
import { CardPlaylistComponent } from './card-playlist/card-playlist.component';
import { ChPlaylistComponent } from './channel/ch-playlist/ch-playlist.component';
import { ChCommunityComponent } from './channel/ch-community/ch-community.component';
import { ChAboutComponent } from './channel/ch-about/ch-about.component';
import { PostingComponent } from './posting/posting.component';
import { PremiumComponent } from './premium/premium.component';
import { SearchComponent } from './search/search.component';
import { ChannelListComponent } from './channel-list/channel-list.component';
import { PlaylistSearchComponent } from './playlist-search/playlist-search.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { ModalShareComponent } from './modal-share/modal-share.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SubscriptionComponent,
    HomeComponent,
    TrendingComponent,
    LibraryComponent,
    HistoryComponent,
    LaterComponent,
    UploaderComponent,
    DropzoneDirective,
    CardComponent,
    VideosComponent,
    CommentComponent,
    NextVideoComponent,
    ReplyComponent,
    HorizontalVideoComponent,
    EntertainmentComponent,
    ListSubscriptionComponent,
    PlaylistComponent,
    PlaylistVideoComponent,
    PlaylistListComponent,
    PlaylistSidebarComponent,
    ModalPlaylistComponent,
    ChHomeComponent,
    ChVideoComponent,
    TestingComponent,
    ChannelComponent,
    CardPlaylistComponent,
    ChPlaylistComponent,
    ChCommunityComponent,
    ChAboutComponent,
    PostingComponent,
    PremiumComponent,
    SearchComponent,
    ChannelListComponent,
    PlaylistSearchComponent,
    NotificationListComponent,
    ModalShareComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocialLoginModule,
    GraphQLModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFirestoreModule,
    BrowserAnimationsModule,
    MatVideoModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '762688082329-of6lqni42g9dvnbjkb85i3isdhlivnht.apps.googleusercontent.com'
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
