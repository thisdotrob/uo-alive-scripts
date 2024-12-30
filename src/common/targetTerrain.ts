import Client from '../globals/client';
import Timer from '../globals/timer';
import Target from '../globals/target';

import { Terrain } from '../types/Terrain';

export default (terrain: Terrain): void => {
  while (Target.open()) {
    Target.terrain(
      terrain.x,
      terrain.y,
      terrain.z,
      terrain.graphic,
    );
    Timer.wait(250);
  }
};
