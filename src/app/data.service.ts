import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  user_id = new String();
  photoUrl = new String();
  logged_in = new Boolean(false);
  isRestriction = new Boolean(false);
  isOwnChannel = new Boolean(false);

  constructor() { }
}
