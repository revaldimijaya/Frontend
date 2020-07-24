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
import { TemporaryComponent } from './temporary/temporary.component'
import { EntertainmentComponent } from './category/entertainment/entertainment.component'
import { ListSubscriptionComponent } from './list-subscription/list-subscription.component'

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
    TemporaryComponent,
    EntertainmentComponent,
    ListSubscriptionComponent
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
