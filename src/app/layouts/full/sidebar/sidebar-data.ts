import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Principal',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:atom-line-duotone',
    route: '/dashboard',
  },
  {
    displayName: 'Reportes',
    iconName: 'lucide:chart-line',
    route: '/reports',
  },
  {
    displayName: 'Mapa',
    iconName: 'material-symbols:map-outline',
    route: '/map/overview',
  },

  {
    navCap: 'Administración Territorial',
  },
  {
    displayName: 'Entidades',
    iconName: 'solar:buildings-2-line-duotone',
    route: '/admin/entities/list',
  },
  {
    displayName: 'Funcionarios',
    iconName: 'solar:user-id-line-duotone',
    route: '/admin/officials/list',
  },
  {
    displayName: 'Ciudadanos',
    iconName: 'solar:users-group-rounded-line-duotone',
    route: '/admin/citizens/list',
  },
  {
    displayName: 'Categorías',
    iconName: 'solar:tag-line-duotone',
    route: '/admin/categories/list',
  },
  {
    displayName: 'Comunas',
    iconName: 'solar:map-point-line-duotone',
    route: '/admin/communes/list',
  },
  {
    displayName: 'Barrios',
    iconName: 'solar:home-2-line-duotone',
    route: '/neighborhood',
  },

  {
    navCap: 'Sesión',
  },
  {
    displayName: 'Salir',
    iconName: 'solar:logout-2-line-duotone',
    action: 'logout',
  },
];
