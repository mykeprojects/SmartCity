import { Entity } from '../territorial/entity';

export interface EntityFormPayload {
  entity: Partial<Entity>;
  logoFile?: File;
}
