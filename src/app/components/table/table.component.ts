import { Component, Input, OnInit, OnChanges, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ActionType } from '../../enums';
import { CsvService } from '../../core/services';

export type ComponentChange<T, P extends keyof T> = {
  previousValue: T[P]
  currentValue: T[P]
  firstChange: boolean
};

export type ComponentChanges<T> = {
  [P in keyof T]?: ComponentChange<T, P>
};

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
  paginator = {
    pageSize: 10,
    pageIndex: 1
  };
  routerSubscription?: Subscription;

  @Input() filters: { field: number; action: ActionType; value: string; }[] = [];

  constructor(private route: ActivatedRoute, private router: Router, public csvService: CsvService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(({ page }) => {
      const currentPage = Number.isInteger(+page) ? +page : 1;

      this.paginator = {
        ...this.paginator,
        pageIndex: currentPage
      }
    });
  }

  ngOnChanges({ filters }: ComponentChanges<TableComponent>) {
    if (filters?.currentValue) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: 1,
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  public trackByFn(i: number, row: string[]) {
    return row[0];
  }

  public filter(rows: string[][]) {
    let filteredRows = rows;
    let fn: ((rows: string[]) => boolean) | undefined;

    this.filters.forEach(filter => {
      const field = filter.field!;

      switch (filter.action) {
        case ActionType.EXISTS:
          fn = (r: string[]) => r[field].toString() === filter.value.toString();
        break;

        case ActionType.DOES_NOT_EXIST:
          fn = (r: string[]) => r[field].toString() !== filter.value.toString();
        break;

        case ActionType.IS_GREATHER_THAN:
          fn = (r: string[]) => {
            console.log(r, filter.value)
            return Number.isNaN(+r[field]) ? !!r[field].localeCompare(filter.value) : +r[field] > +filter.value;
          };
        break;

        case ActionType.IS_LESS_THAN:
          fn = (r: string[]) => {
            return Number.isNaN(+r[field]) ? !!filter.value!.localeCompare(r[field]) : +r[field] < +filter.value;
          };
        break;

        case ActionType.CONTAINS:
          fn = (r: string[]) => r[field].toLowerCase()?.includes(filter.value.toLowerCase());
        break;

        case ActionType.DOES_NOT_CONTAINS:
          fn = (r: string[]) => !r[field].toLowerCase()?.includes(filter.value.toLowerCase());
        break;
      
        default:
          break;
      }

      if (fn) {
        filteredRows = filteredRows.filter(fn);
      }
    });

    return filteredRows.length ? filteredRows: [[]];
  }
}
