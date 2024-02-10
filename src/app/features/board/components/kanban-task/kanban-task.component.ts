import { Component, Input } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Task } from '../../../../shared';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
    selector: 'app-kanban-task',
    standalone: true,
    imports: [CdkDrag, CardComponent],
    template: `
      <app-card> 
          <div cdkDrag>
              <h3 class="task-title">{{ task.title }}</h3>
          </div>
      </app-card>
  `,
  styleUrl: './kanban-task.component.scss'
})
export class KanbanTaskComponent {
    @Input({ required: true }) task!: Task;
}
