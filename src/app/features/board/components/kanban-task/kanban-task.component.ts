import { Component, Input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Task } from '../../../../shared';

@Component({
    selector: 'app-kanban-task',
    standalone: true,
    imports: [CdkDrag],
    template: `
    <div cdkDrag class="card">
        <small class="task-title">{{ task.title }}</small>
    </div>
  `,
})
export class KanbanTaskComponent {
    @Input({ required: true }) task!: Task;
}
