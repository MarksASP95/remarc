import { ModelDBData } from './general.model';

export interface RemarcUserCreate {
  name: string;
  email: string;
}

export interface RemarcUser extends RemarcUserCreate, ModelDBData {}