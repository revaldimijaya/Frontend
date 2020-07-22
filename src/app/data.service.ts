import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  user_id = new String();
  photoUrl = new String();

  constructor() { }
}
