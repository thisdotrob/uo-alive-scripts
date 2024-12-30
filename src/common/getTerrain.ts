import Client from '../globals/client';

import Terrain from '../types/Terrain';

export default (x: number, y: number): Terrain | undefined => {
  const terrainList = Client.getTerrainList(x, y);
  return terrainList?.find((terrain) => !terrain.isLand);
};
