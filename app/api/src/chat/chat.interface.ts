import { Message } from "./message/message.type";

export interface ServerToClientEvents {
	chat: (e: Message) => void;
  }
  
  export interface ClientToServerEvents {
	chat: (e: Message) => void;
  }