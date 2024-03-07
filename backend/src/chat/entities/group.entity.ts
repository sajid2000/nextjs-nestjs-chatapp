export class GroupInfoEntity {
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

  constructor(items: GroupInfoEntity) {
    Object.assign(this, items);
  }
}
