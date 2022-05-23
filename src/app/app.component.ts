import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { CsvService } from './core/services';
import { ActionType } from './enums';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  stringAndNumberActions = [
    // ActionType.IS_EQUAL, 
    // ActionType.IS_NOT_EQUAL, 
    ActionType.IS_GREATHER_THAN, 
    ActionType.IS_LESS_THAN,
    // ActionType.IS_BETWEEN,
    ActionType.EXISTS,
    ActionType.DOES_NOT_EXIST
  ];
  stringActions = [ActionType.CONTAINS, ActionType.DOES_NOT_CONTAINS];
  filter: any = new FormArray([]);
  filters: { field: number; action: ActionType; value: string; }[] = [];

  constructor(public csvService: CsvService) {}

  public handleFileChange(e: any) {
    this.csvService.parse(e.target.files[0]);
  }

  public handleSubmit(e: SubmitEvent): void {
    e.preventDefault();

    if (this.filter.status === "INVALID") {
      window.alert("Form is invalid!");
    } else {
      this.applyFilters();
    }
  }

  public addFilter() {
    this.filter.push(new FormGroup({
      field: new FormControl('', Validators.required),
      action: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required),
    }));
  }

  public removeFilter(index: number) {
    this.filter.removeAt(index);

    this.applyFilters();
  }

  public trackByFn(i: number, row: { field?: number; action?: ActionType; value?: string; }) {
    return `${i}-${row.field}-${row.action}-${row.value}`;
  };

  private applyFilters() {
    const filters: { field: number; action: ActionType; value: string; }[] = [];

    this.filter.controls.forEach(({ value }: FormArray) => {
      filters.push(value);
    });

    this.filters = filters;
  }
}
