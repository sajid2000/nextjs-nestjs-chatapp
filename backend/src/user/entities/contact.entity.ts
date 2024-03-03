export class ContactEntity {
  id: number;

  fullName: string;

  phone: number;

  avatar: string | null;

  isOnline: boolean;

  lastSeen: Date | null;

  constructor(items: ContactEntity) {
    Object.assign(this, items);
  }
}
