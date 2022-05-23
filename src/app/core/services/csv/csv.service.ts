import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { CSV_FILE_CONTENT } from '../../../constants';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  isLoadingSub: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
  columnsSub: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
  rowsSub: BehaviorSubject<string[][]> = new BehaviorSubject([[]] as string[][]);

  constructor() {
    this.handleComplete = this.handleComplete.bind(this);

    this.laodFromStorage();
  }

  get isLoading$() {
    return this.isLoadingSub.asObservable();
  }

  get columns$() {
    return this.columnsSub.asObservable();
  }

  get rows$() {
    return this.rowsSub.asObservable();
  }

  private laodFromStorage() {
    const json = localStorage.getItem(CSV_FILE_CONTENT);

    if (json) {
      try {
        const { rows, columns } = JSON.parse(json);

        this.columnsSub.next(columns);

        this.rowsSub.next(rows);
      } catch(error) {
        console.error(error);
      }
    }
  }

  private async saveToStorage() {
    const columns = await this.columns$.pipe(take(1)).toPromise();
    const rows = await this.rows$.pipe(take(1)).toPromise();

    localStorage.setItem(CSV_FILE_CONTENT, JSON.stringify({ columns, rows }));
  }

  private handleComplete({ data }: { data: string[][] }) {
    this.updateTableData(data);

    this.saveToStorage();
  }

  private updateTableData(data: string[][]) {
    this.columnsSub.next(data.splice(0, 1)[0]);

    this.rowsSub.next(data);
  }

  public async parse(file?: File | null) {
    if (file) {
      this.isLoadingSub.next(true);

      const Papa = await import('papaparse');

      Papa.parse(file, {
        complete: (results) => {
          this.isLoadingSub.next(false);

          this.handleComplete(results as { data: string[][] })
        },
        error: () => {
          this.isLoadingSub.next(false);
        }
      });
    }
  }
}
