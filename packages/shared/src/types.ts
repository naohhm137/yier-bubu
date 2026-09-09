/** Shared wire types used by the browser and the realtime server. */
export type RoomPhase = 'lobby' | 'playing' | 'finished';

export type PlayerStatus = 'connected' | 'ready' | 'away' | 'eliminated';

export interface Player {
  id: string;
  name: string;
  characterId: string;
  status: PlayerStatus;
  vitality: number;
  friendship: number;
  /** Secret fields are only sent to the owning socket by the server. */
  identityId?: string;
  hand?: string[];
  bonds: string[];
}

export interface PublicPlayer extends Omit<Player, 'identityId' | 'hand'> {
  handSize: number;
}

export interface RoomState {
  roomId: string;
  phase: RoomPhase;
  hostId: string;
  sceneId: string | null;
  round: number;
  activePlayerId: string | null;
  players: PublicPlayer[];
  deckSize: number;
  discardPile: string[];
  wishFragments: number;
  actionLog: string[];
  winnerId: string | null;
}

export interface PrivatePlayerState {
  player: Player;
  room: RoomState;
}

export interface CreateRoomPayload { name: string; characterId?: string; }
export interface JoinRoomPayload { roomId: string; name: string; characterId?: string; }
export interface PlayerIdPayload { playerId: string; }

export interface ErrorPayload { code: string; message: string; }

export interface ClientToServerEvents {
  'room:create': (payload: CreateRoomPayload, ack?: Ack<CreateRoomResult>) => void;
  'room:join': (payload: JoinRoomPayload, ack?: Ack<JoinRoomResult>) => void;
  'room:ready': (payload: PlayerIdPayload, ack?: Ack<RoomState>) => void;
  'room:start': (payload: PlayerIdPayload, ack?: Ack<RoomState>) => void;
  'room:leave': (payload: PlayerIdPayload) => void;
  'game:action': (payload: { playerId: string; cardId?: string; action: string; targetId?: string }, ack?: Ack<RoomState>) => void;
}

export interface ServerToClientEvents {
  'room:created': (result: CreateRoomResult) => void;
  'room:joined': (result: JoinRoomResult) => void;
  'room:state': (state: RoomState) => void;
  'player:private-state': (state: PrivatePlayerState) => void;
  'room:error': (error: ErrorPayload) => void;
}

export interface CreateRoomResult { room: RoomState; playerId: string; }
export interface JoinRoomResult { room: RoomState; playerId: string; }
export type Ack<T> = (result: T | ErrorPayload) => void;
