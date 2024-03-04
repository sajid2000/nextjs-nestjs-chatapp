import { Inject, NotFoundException, UseGuards } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import * as cookie from "cookie";
import { Socket } from "socket.io";

import { AccessTokenPayload } from "@/auth/auth.module";
import { WSAuthGuard } from "@/auth/guards/ws-auth.guard";
import { authConfig } from "@/config";
import { UserService } from "@/user/services/user.service";

import {
  messageDeliveredRequestSchema,
  messageSeenRequestSchema,
  messageSendRequestSchema,
  messageTypingRequestSchema,
} from "./dto/message.dto";
import { ConversationService } from "./services/conversation.service";
import { MessageService } from "./services/message.service";
import { MESSAGE_STATUS, MessageResponsePayload } from "./types";

@UseGuards(WSAuthGuard)
@WebSocketGateway({ cors: { origin: "http://localhost:3000", credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  constructor(
    @Inject(authConfig.KEY) private authConf: ConfigType<typeof authConfig>,
    private jwtService: JwtService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie, { httpOnly: true });

      const user = await this.verifyToken(cookies.accessToken);
      // update user online status
      await this.userService.update(user.id, { isOnline: true });

      const userConversations = await this.conversationService.getUserConversationList(user.id);
      const conversationIds = userConversations.map((i) => i.conversationId.toString());

      client.join(conversationIds);

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

      const userConversations = await this.conversationService.getUserConversationList(user.id);
      const conversationIds = userConversations.map((i) => i.conversationId.toString());

      client.to(conversationIds).emit("userDisconnected", {
        userId: user.id,
        lastSeen: updatedUser.lastSeen,
      });
    } catch (error) {
      //
    }
  }

  @SubscribeMessage("messageSend")
  async handleMessage(client: Socket, payload: any, cb: any) {
    if (cb && typeof cb !== "function") {
      throw new Error('Second arg of "messageSend" event should be a callback function');
    }

    const validate = messageSendRequestSchema.safeParse(payload);

    if (!validate.success) {
      cb({ status: "ERROR", error: validate.error.flatten().fieldErrors });

      return;
    }

    const user = client.request.user;

    const { conversationId, messageContent, messageType } = validate.data;

    // find conversation, if already exists with receiver.
    const conversation = await this.conversationService.getUserConversation({ userId: user.id, conversationId: conversationId });

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
        name: user.fullName,
        avatar: user.avatar,
      },
    };

    // emit an event to subscribed user.
    this.server.to(conversation.id.toString()).emit("messageReceived", newChatMessage);
  }

  @SubscribeMessage("messageDelivered")
  async handleMessageDelivered(client: Socket, payload: any, cb: any) {
    if (cb && typeof cb !== "function") {
      throw new Error("Second arg of 'messageDelivered' event should be a callback function");
    }

    const validate = messageDeliveredRequestSchema.safeParse(payload);

    if (!validate.success) {
      cb({ status: "ERROR", error: validate.error.flatten().fieldErrors });

      return;
    }

    const { conversationId } = validate.data;

    await this.messageService.updateConversationMessagesStatus(conversationId, MESSAGE_STATUS.delivered);

    client.to(conversationId.toString()).emit("messageDelivered", { conversationId });
  }

  @SubscribeMessage("messageSeen")
  async handleMessageSeen(client: Socket, payload: any, cb: any) {
    if (cb && typeof cb !== "function") {
      throw new Error("Second arg of 'messageSeen' event should be a callback function");
    }

    const validate = messageSeenRequestSchema.safeParse(payload);

    if (!validate.success) {
      cb({ status: "ERROR", error: validate.error.flatten().fieldErrors });

      return;
    }

    const { conversationId } = validate.data;

    await this.messageService.updateConversationMessagesStatus(conversationId, "seen");

    client.to(conversationId.toString()).emit("messageSeen", { conversationId });
  }

  @SubscribeMessage("messageTypingStart")
  async handleMessageTypingStart(client: Socket, payload: any, cb: any) {
    const senderId = client.request.user.id;

    if (cb && typeof cb !== "function") {
      throw new Error("Second arg of 'messageTypingStart' event should be a callback function");
    }

    const validate = messageTypingRequestSchema.safeParse(payload);

    if (!validate.success) {
      cb({ status: "ERROR", error: validate.error.flatten().fieldErrors });

      return;
    }

    const { conversationId } = validate.data;

    try {
      await this.conversationService.getUserConversation({ userId: senderId, conversationId });

      client.to(conversationId.toString()).emit("messageTypingStart", { conversationId });
    } catch (error) {
      //
    }
  }

  @SubscribeMessage("messageTypingStop")
  async handleMessageTypingStop(client: Socket, payload: any, cb: any) {
    const senderId = client.request.user.id;

    if (cb && typeof cb !== "function") {
      throw new Error("Second arg of 'messageTypingStop' event should be a callback function");
    }

    const validate = messageTypingRequestSchema.safeParse(payload);

    if (!validate.success) {
      cb({ status: "ERROR", error: validate.error.flatten().fieldErrors });

      return;
    }

    const { conversationId } = validate.data;

    try {
      await this.conversationService.getUserConversation({ userId: senderId, conversationId });

      client.to(conversationId.toString()).emit("messageTypingStop", { conversationId });
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
