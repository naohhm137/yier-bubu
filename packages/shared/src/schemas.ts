/** Small runtime guards. Keep validation dependency free for the starter server. */
export const isNonEmptyString = (value: unknown, max = 32): value is string => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
export const isRoomCode = (value: unknown): value is string => typeof value === 'string' && /^[A-Z0-9]{4,8}$/.test(value);
