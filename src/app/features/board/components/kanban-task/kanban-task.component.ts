import { Component, Input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Task } from '../../../../shared';

@Component({
    selector: 'app-kanban-task',
    standalone: true,
    imports: [CdkDrag],
    template: `
      <div cdkDrag class="task">
          <h3>{{ task.title }}</h3>
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
export class KanbanTaskComponent {
    @Input({ required: true }) task!: Task;
}
