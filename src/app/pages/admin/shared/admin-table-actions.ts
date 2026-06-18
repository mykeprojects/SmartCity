import { ActionButton } from 'src/app/models/component-dynamic-table/action-button';

export const ADMIN_TABLE_ACTIONS: ActionButton[] = [
  {
    id: 'view',
    label: 'Ver',
    icon: 'heroEye',
    class: 'admin-table-action admin-table-action--view',
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: 'heroPencil',
    class: 'admin-table-action admin-table-action--edit',
  },
  {
    id: 'delete',
    label: 'Eliminar',
    icon: 'heroTrash',
    class: 'admin-table-action admin-table-action--delete',
  },
];
