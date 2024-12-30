import { ItemGraphic } from '../enums/ItemGraphic';
import { Item } from '../types/Item';
import { Terrain } from '../types/Terrain';

export default {
  findType: (itemGraphic: ItemGraphic): Item => client.findType(itemGraphic),
  getTerrainList: (x: number, y: number): undefined | Terrain[] => client.getTerrainList(x, y),
};
