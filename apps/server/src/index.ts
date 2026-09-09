import Fastify from 'fastify';
import { Server } from 'socket.io';
import { RoomManager } from './RoomManager.js';
import type { ClientToServerEvents, ServerToClientEvents, ErrorPayload } from '../../../packages/shared/src/index.js';

const app = Fastify({ logger: true });
const io = new Server<ClientToServerEvents, ServerToClientEvents>(app.server, { cors: { origin: true, credentials: true } });
const rooms = new RoomManager();
const emitError = (socket: any, error: unknown) => { const payload: ErrorPayload = { code: 'BAD_REQUEST', message: error instanceof Error ? error.message : '请求失败' }; socket.emit('room:error', payload); return payload; };
const broadcast = (room: any) => { io.to(room.roomId).emit('room:state', room.publicState()); for (const player of room.players.values()) io.to(player.id).emit('player:private-state', room.privateState(player.id)); };
const ownPlayerId = (socket: any, claimedId: string) => { if (!socket.data.playerId || socket.data.playerId !== claimedId) throw new Error('玩家身份校验失败'); return claimedId; };

app.get('/health', async () => ({ ok: true, service: 'mengjing-server', rooms: 'in-memory' }));
app.get('/room/:roomId', async (request, reply) => { const room = rooms.get((request.params as any).roomId); if (!room) return reply.code(404).send({ error: 'NOT_FOUND' }); return room.publicState(); });

io.on('connection', socket => {
  socket.on('room:create', (payload, ack) => { try { const room = rooms.create(payload.name, payload.characterId); const playerId = room.hostId; socket.data.playerId = playerId; socket.data.roomId = room.roomId; socket.join(room.roomId); socket.join(playerId); const result = { room: room.publicState(), playerId }; socket.emit('room:created', result); ack?.(result); broadcast(room); } catch (e) { ack?.(emitError(socket, e)); } });
  socket.on('room:join', (payload, ack) => { try { const joined = rooms.join(payload.roomId, payload.name, payload.characterId); socket.data.playerId = joined.player.id; socket.data.roomId = joined.room.roomId; socket.join(joined.room.roomId); socket.join(joined.player.id); const result = { room: joined.room.publicState(), playerId: joined.player.id }; socket.emit('room:joined', result); ack?.(result); broadcast(joined.room); } catch (e) { ack?.(emitError(socket, e)); } });
  socket.on('room:ready', (payload, ack) => { try { const room = rooms.get(socket.data.roomId); if (!room) throw new Error('你还没有加入房间'); room.setReady(ownPlayerId(socket, payload.playerId)); ack?.(room.publicState()); broadcast(room); } catch (e) { ack?.(emitError(socket, e)); } });
  socket.on('room:start', (payload, ack) => { try { const room = rooms.get(socket.data.roomId); if (!room) throw new Error('你还没有加入房间'); room.start(ownPlayerId(socket, payload.playerId)); ack?.(room.publicState()); broadcast(room); } catch (e) { ack?.(emitError(socket, e)); } });
  socket.on('game:action', (payload, ack) => { try { const room = rooms.get(socket.data.roomId); if (!room) throw new Error('你还没有加入房间'); room.action(ownPlayerId(socket, payload.playerId), payload.action, payload.cardId, payload.targetId); ack?.(room.publicState()); broadcast(room); } catch (e) { ack?.(emitError(socket, e)); } });
  socket.on('room:leave', payload => { const room = rooms.get(socket.data.roomId); if (!room) return; try { room.removePlayer(ownPlayerId(socket, payload.playerId)); } catch (e) { emitError(socket, e); return; } socket.leave(room.roomId); socket.leave(payload.playerId); broadcast(room); rooms.removeIfEmpty(room.roomId); });
  socket.on('disconnect', () => { const room = rooms.get(socket.data.roomId); if (!room || !socket.data.playerId) return; const player = room.players.get(socket.data.playerId); if (player) player.status = 'away'; broadcast(room); });
});

const port = Number(process.env.PORT ?? 8787);
app.listen({ port, host: '0.0.0.0' }).catch(error => { app.log.error(error); process.exit(1); });
