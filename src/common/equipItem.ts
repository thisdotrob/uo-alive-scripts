import { ItemGraphic } from '../enums/ItemGraphic';
import Player from '../globals/player';
import Client from '../globals/client';
import { headMsg } from './logging';

export default (itemGraphic: ItemGraphic) => {
  headMsg('Equipping item');
  sleep(4000);
  const item = Client.findType(itemGraphic);
  sleep(500);
  Player.equip(item);
  headMsg('Equipped item');
  sleep(2000);
}
