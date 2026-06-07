import { ActionButton } from 'src/app/models/component-dynamic-table/action-button';

export const ADMIN_TABLE_ACTIONS: ActionButton[] = [
  {
    id: 'view',
    label: 'Ver',
    icon: 'heroEye',
    class:
      'flex-1 px-2 py-1 rounded bg-blue-500 text-white cursor-pointer flex items-center justify-center gap-1',
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: 'heroPencil',
    class:
      'flex-1 px-2 py-1 rounded bg-yellow-400 text-black cursor-pointer flex items-center justify-center gap-1',
  },
  {
    id: 'delete',
    label: 'Eliminar',
    icon: 'heroTrash',
    class:
      'flex-1 px-2 py-1 rounded bg-red-500 text-white cursor-pointer flex items-center justify-center gap-1',
  },
];
