import Journal from '../globals/journal';
import Player from '../globals/player';
import Target from '../globals/target';
import Timer from '../globals/timer';

import getTerrain from './getTerrain';
import targetTerrain from './targetTerrain';
import waitForJournalText from './waitForJournalText';

import { MiningResult, MiningJournalMessages } from '../strings';

export default (offsetX: number, offsetY: number): MiningResult => {
  Journal.clear();

  while (!Target.open()) {
    Player.useItemInHand();
    Timer.wait(100);
  }

  const x = Player.x() + offsetX;
  const y = Player.y() + offsetY;

  const terrain = getTerrain(x, y)

  if (!terrain) { return MiningResult.invalidTerrain };

  targetTerrain(terrain);

  return waitForJournalText(MiningJournalMessages);
}

