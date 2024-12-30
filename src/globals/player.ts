import { Item } from '../types/Item';

export default {
  equip: (item: Item): void => player.equip(item),
  useItemInHand: (): void => player.useItemInHand(),
  x: (): number => player.x,
  y: (): number => player.y,
};
