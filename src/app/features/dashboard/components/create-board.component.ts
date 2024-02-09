import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-kanban-create-board',
    standalone: true,
    template: `
      <div>
          Inside board create
      </div>
  `,
    styles: `
    .task {
        padding: 1rem;
        background-color: #ccc;
        border: 1px solid black;
    }
    `
})
export class CreateBoardComponent {
    constructor(private fb: FormBuilder) {}

    form = this.fb.group({
        board_name: ['', Validators.required],
    })
}
