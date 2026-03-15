export interface AvatarDefinition {
  id: string;
  name: string;
  spriteKey: string;
}

export const AVATARS: AvatarDefinition[] = [
  { id: 'default', name: 'Hráč', spriteKey: 'player' },
];
