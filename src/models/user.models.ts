import { ModelDBData } from './general.model';

export interface UserCreate {
  name: string;
  email: string;
}

export interface User extends UserCreate, ModelDBData {}