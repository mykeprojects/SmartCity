export function officialHasEntity(official: { id_entity?: number | null }): boolean {
  return official.id_entity != null && official.id_entity > 0;
}

export const OFFICIAL_ROLES = [
  { value: 'official', label: 'Funcionario' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'admin', label: 'Administrador' },
] as const;

export function formatOfficialRole(role?: string | null): string {
  if (!role) return '-';
  return OFFICIAL_ROLES.find((r) => r.value === role)?.label ?? role;
}
