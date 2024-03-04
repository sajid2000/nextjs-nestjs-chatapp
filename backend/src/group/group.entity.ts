export class GropuConversationEntity {
  groupId: number;

  conversationId: number;

  name: string;

  image: string | null;

  constructor(items: GropuConversationEntity) {
    Object.assign(this, items);
  }
}
