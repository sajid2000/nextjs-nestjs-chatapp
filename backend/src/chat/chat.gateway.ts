import { Inject, NotFoundException, UseGuards } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import * as cookie from "cookie";
import { Socket } from "socket.io";

import { AccessTokenPayload } from "@/auth/auth.module";
import { WSAuthGuard } from "@/auth/guards/ws-auth.guard";
import { authConfig } from "@/config";
import { UserService } from "@/user/services/user.service";

import { ConversationService } from "./services/conversation.service";
import { GroupService } from "./services/group.service";
import { MessageService } from "./services/message.service";
import { MESSAGE_STATUS, MessageResponsePayload } from "./types";
import {
  groupConversationCreatedRequestSchema,
  joinConversationRequestSchema,
  privateConversationCreatedRequestSchema,
} from "./validators/conversation.validator";
import {
  messageDeliveredRequestSchema,
  messageSeenRequestSchema,
  messageSendRequestSchema,
  messageTypingRequestSchema,
} from "./validators/message.validator";

@UseGuards(WSAuthGuard)
@WebSocketGateway({ cors: { origin: "http://localhost:3000", credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  constructor(
    @Inject(authConfig.KEY) private authConf: ConfigType<typeof authConfig>,
    private jwtService: JwtService,
    private conversationService: ConversationService,
    private groupService: GroupService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie, { httpOnly: true });

      const user = await this.verifyToken(cookies.accessToken);
      // update user online status
      await this.userService.update(user.id, { isOnline: true });

      const userConversations = await this.conversationService.getAllConversationsIdOfUser(user.id);
      const conversationIds = userConversations.map((i) => `conversation:${i.conversationId}`);

      client.join(conversationIds);
      client.join(`user:${user.id}`);

      client.to(conversationIds).emit("userConnected", {
        userId: user.id,
        name: user.fullName,
        phone: user.phone,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        client._error({ message: "Unauthorized!" });
      } else {
        client._error({ message: "Something went wrong!" });
      }

      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie, { httpOnly: true });

      const user = await this.verifyToken(cookies.accessToken);

      const updatedUser = await this.userService.update(user.id, { isOnline: false, lastSeen: new Date() });

      const userConversations = await this.conversationService.getAllConversationsIdOfUser(user.id);
      const conversationIds = userConversations.map((i) => `conversation:${i.conversationId}`);

      client.to(conversationIds).emit("userDisconnected", {
        userId: user.id,
        lastSeen: updatedUser.lastSeen,
      });
    } catch (error) {
      //
    }
  }

  @SubscribeMessage("privateConversationCreated")
  async handlePrivateConversationCreated(client: Socket, payload: any) {
    const validate = privateConversationCreatedRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const user = client.request.user;
    const { conversationId } = validate.data;

    // find or create conversation
    const userConversation = await this.conversationService.getConversationWithDetails({ userId: user.id, conversationId });
    const participant = await this.conversationService.getPrivateConversationParticipantOfUser({
      userId: user.id,
      conversationId,
    });
    const participantConversaton = await this.conversationService.getConversationWithDetails({
      userId: participant.id,
      conversationId,
    });

    if (userConversation.isGroup) throw new WsException({ message: "Conversaton not found" });

    // emit newConversation event to both user.
    this.server.to(`user:${user.id}`).emit("newConversation", userConversation);
    this.server.to(`user:${participant.id}`).emit("newConversation", participantConversaton);
  }

  @SubscribeMessage("groupConversationCreated")
  async handleGroupConversationCreated(client: Socket, payload: any) {
    const validate = groupConversationCreatedRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const user = client.request.user;
    const { conversationId, groupId } = validate.data;

    // find or create conversation
    const conversation = await this.conversationService.getConversationWithDetails({ userId: user.id, conversationId });

    if (conversation.id !== groupId || !conversation.isGroup)
      throw new WsException({ message: "Conversation group not matched" });

    const groupMembers = await this.groupService.getAllMembersOfGroup(conversation.participantOrGroupId);

    // emit newConversation event to both user.
    this.server.to([`user:${user.id}`, ...groupMembers.map((i) => `user:${i.id}`)]).emit("newConversation", conversation);
  }

  @SubscribeMessage("joinConversation")
  async handleJoinConversation(client: Socket, payload: any) {
    const validate = joinConversationRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const { conversationId } = validate.data;

    client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage("messageSend")
  async handleMessage(client: Socket, payload: any) {
    const validate = messageSendRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const user = client.request.user;

    const { conversationId, messageContent, messageType } = validate.data;

    // find conversation, if already exists with receiver.
    const conversation = await this.conversationService.getConversationOfUser({
      userId: user.id,
      conversationId: conversationId,
    });

    // save message in db.
    const message = await this.messageService.saveMessage({
      conversationId: conversation.id,
      senderId: user.id,
      messageContent,
      messageType: messageType,
    });

    const newChatMessage: MessageResponsePayload = {
      message: {
        id: message.id,
        messageContent: message.messageContent,
        sentDate: message.sentDate,
        messageStatus: message.messageStatus as any,
        messageType,
      },
      conversation: {
        id: conversation.id,
        isGroup: false,
      },
      sender: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
      },
    };

    // emit an event to subscribed user.
    this.server.to(`conversation:${conversation.id}`).emit("messageReceived", newChatMessage);
  }

  @SubscribeMessage("messageDelivered")
  async handleMessageDelivered(client: Socket, payload: any) {
    const validate = messageDeliveredRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const { conversationId } = validate.data;

    await this.messageService.updateConversationMessagesStatus(conversationId, MESSAGE_STATUS.delivered);

    client.to(`conversation:${conversationId}`).emit("messageDelivered", { conversationId });
  }

  @SubscribeMessage("messageSeen")
  async handleMessageSeen(client: Socket, payload: any) {
    const validate = messageSeenRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const { conversationId } = validate.data;

    await this.messageService.updateConversationMessagesStatus(conversationId, "seen");

    client.to(`conversation:${conversationId}`).emit("messageSeen", { conversationId });
  }

  @SubscribeMessage("messageTypingStart")
  async handleMessageTypingStart(client: Socket, payload: any) {
    const senderId = client.request.user.id;
    const validate = messageTypingRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const { conversationId } = validate.data;

    try {
      await this.conversationService.getConversationOfUser({ userId: senderId, conversationId });

      client.to(`conversation:${conversationId}`).emit("messageTypingStart", { conversationId });
    } catch (error) {
      //
    }
  }

  @SubscribeMessage("messageTypingStop")
  async handleMessageTypingStop(client: Socket, payload: any) {
    const senderId = client.request.user.id;
    const validate = messageTypingRequestSchema.safeParse(payload);

    if (!validate.success) {
      throw new WsException({ message: "Validation failed!", fields: validate.error.flatten().fieldErrors });
    }

    const { conversationId } = validate.data;

    try {
      await this.conversationService.getConversationOfUser({ userId: senderId, conversationId });

      client.to(`conversation:${conversationId}`).emit("messageTypingStop", { conversationId });
    } catch (error) {
      //
    }
  }

  private async verifyToken(accessToken: string) {
    const payload = this.jwtService.verify(accessToken, {
      secret: this.authConf.accessTokenSecret,
    }) as AccessTokenPayload;

    return this.userService.findByPhone(payload.phone);
  }
}
