export interface UserRegistrationPayload<T> {
  data: Partial<T>;
  password: string;
}
