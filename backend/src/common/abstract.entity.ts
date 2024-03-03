export abstract class AbstractEntity<T> {
  id: number;

  createdAt: Date;

  updatedAt: Date;

  constructor(items: T) {
    Object.assign(this, items);
  }
}
