export class GroupEntity {
  id: number;

  conversationId: number;

  name: string;

  createdAt: Date;

  updatedAt: Date;

  image: string | null;

  creator: number | null;

  members: {
    id: number;
    fullName: string;
    phone: number;
    avatar: string | null;
  }[];

  constructor(items: GroupEntity) {
    Object.assign(this, items);
  }
}
