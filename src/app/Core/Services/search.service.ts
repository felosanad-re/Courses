import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchTerm = new BehaviorSubject('');
  $searchTerm = this.searchTerm.pipe(debounceTime(500), distinctUntilChanged());

  constructor() {}

  updateSearchTrim(term: string) {
    this.searchTerm.next(term);
  }
}
