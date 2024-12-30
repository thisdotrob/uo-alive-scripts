import Timer from './globals/timer';
import Target from './globals/target';

import { headMsg } from './common/logging';
import equipItem from './common/equipItem';
import usePickaxe from './common/usePickaxe';

import { ItemGraphic } from './enums/ItemGraphic';
import { Directions } from './enums/Directions';
import { Spells } from './enums/Spells';

import { Item } from './types/Item';

const worn_out_msg = "You have worn out";

const equip_pickaxe = () => {
  equipItem(ItemGraphic.PickAxe);
}

const move_ore_to_beetle = () => {
  const ore = player.backpack.contents.filter((item: Item) => item.name.includes('Ore'))

  const beetle_backpack = client.findObject(0x401AAD19)

  ore.forEach((item: Item) => player.moveItem(item, beetle_backpack));
  Timer.wait(100)
}

const mine = (offset_x: number, offset_y: number) => {
  dismount_beetle();

  while (true) {
    if (journal.containsText(worn_out_msg)) {
      headMsg.red('Tool worn out')
      equip_pickaxe();
    }

    if ((player.weightMax - player.weight) < 50) {
      headMsg.red("Backpack full!");
      return 'backpack-full';
    }

    headMsg.red(`Starting to mine (${offset_x}, ${offset_y})`);
    const result = usePickaxe(offset_x, offset_y);
    Timer.wait(1000);

    if (result === 'no-metal') {
      headMsg.red('No metal left')
      return result;
    } else if (result === 'backpack-full') {
      headMsg.red('Backpack full')
      return result;
    } else if (result === 'success') {
      headMsg.red('Mining successful');
      move_ore_to_beetle();
    } else if (result === 'cannot-see') {
      headMsg.red('Cannot see target');
      return result;
    } else if (result === 'unmineable') {
      headMsg.red('Can\'t mine that tile');
      return result; 
    } else {
      headMsg.red('Mining failed');
    }
  }
}

const teleport = (location: string) => {
  const runes: { [key: string]: number } = {
    'brit-forge': 0x4185E517,
    'house': 0x4185E3C2,
    'new-haven': 0x4185EDFD,
    'house-mine': 0x4185E569,
  };

  const rune = runes[location];

  if (!rune) {
    throw new Error(`Invalid location passed to teleport: ${location}`);
  }

  const { x, y } = player;

  mount_beetle();

  while (true) {
    headMsg.red(`Teleporting to ${location}`);
    player.cast(Spells.SacredJourney);
    target.wait();
    target.entity(rune);
    Timer.wait(2000);
    if (x === player.x && y === player.y) {
      headMsg.red("Failed to teleport")
    } else {
      break;
    }
  }
}

const ore_weights: { [key: number]: number } = {
  0x19B7: 2,
  0x19B8: 7,
  0x19B9: 12,
  0x19BA: 7,
}

const enough_to_smelt = (item: Item) => item.graphic !== 0x19B7 || item.amount > 1 // small graphic ore does not have enough metal to smelt if quantity is 1

const move_ore_to_backpack = () => {
  const beetle_backpack = client.findObject(0x401AAD19);

  const ore = beetle_backpack.contents.find((item: Item) => {
    return item.name.includes('Ore') && enough_to_smelt(item);
  })

  if (ore) {
    const current_weight = player.weight;
    const max_weight = player.weightMax;
    const weight_left = max_weight - current_weight;
    const ore_weight = ore_weights[ore.graphic];
    const max_amount = Math.floor(weight_left / ore_weight);
    const amount = max_amount > ore.amount ? ore.amount : max_amount;
    headMsg.red(`Moving ${amount} ore to backpack`);
    player.moveItem(ore, player.backpack, 0, 0, 0, amount);
    Timer.wait(1000);
    return 'success';
  } else {
    headMsg.red('No ore left to move');
    return 'no-ore';
  }
}

const smelt_success_msg = 'put the metal';
const smelt_fail_msg = 'You burn away';
const smelt_not_enough_msg = 'There is not enough';

const smelt_msgs = [smelt_success_msg, smelt_not_enough_msg, smelt_fail_msg];

const smelt_from_backpack = () => {
  const forge = client.findObject(0x40305A9F);

  const ore = player.backpack.contents.find((item: Item) => {
    return item.name.includes('Ore') && enough_to_smelt(item);
  })

  if (!ore) {
    headMsg.red('Not enough ore in backpack to smelt');
    return 'no-ore';
  }

  const amount = ore.amount;

  journal.clear();

  player.use(ore);

  target.wait();

  target.entity(forge);

  const msg = journal.waitForTextAny(smelt_msgs, 'System', 60000);

  Timer.wait(1000);

  if (msg === smelt_success_msg) {
    headMsg.red(`Smelted ${amount} ore`);
    return 'success';
  } else {
    headMsg.red(`Failed smelting ${amount} ore`);
    return 'fail';
  }
}

const smelt = () => {
  dismount_beetle();
  while (move_ore_to_backpack() === 'success') {
    while (smelt_from_backpack() !== 'no-ore') {
      continue;
    }
  }
  smelt_from_backpack();
}

const close_door = () => {
  headMsg.red('Checking if need to close door');
  const door_serial = 0x40CF51D4;

  const open_door_graphic = 0x6A6;

  const door = client.findObject(door_serial);

  if (door.graphic === open_door_graphic) {
    headMsg.red('Closing door');
    player.use(door_serial);
    headMsg.red('Door shut');
  } else {
    headMsg.red('Door already closed');
  }

  Timer.wait(1000);
}

const walk = (direction: Directions) => {
  if (player.direction !== direction) {
    player.run(direction);
    Timer.wait(500);
  }

  player.run(direction);
  Timer.wait(500);
}

const walk_to_house = () => {
  Timer.wait(1000);
  mount_beetle();
  walk(Directions.Up);
  walk(Directions.Up);
  walk(Directions.North);
  walk(Directions.North);
  close_door();
  walk(Directions.North);
  walk(Directions.North);
  walk(Directions.North);
}

const dismount_beetle = () => {
  const beetle_serial = 0x283FE;

  if (player.equippedItems.mount) {
    player.use(player);
    headMsg.red("Dismounted");
  } else {
    headMsg.red("Already dismounted");
  }

  Timer.wait(1000);
}

const mount_beetle = () => {
  const beetle_serial = 0x283FE;

  if (player.equippedItems.mount) {
    headMsg.red("Already mounted");
  } else {
    player.use(beetle_serial)
    headMsg.red("Mounted");
  }

  Timer.wait(1000);
}

const drop_ingots = () => {
  const chest_serial = 0x40F7013F;

  const chest = client.findObject(chest_serial);

  const ingots = player.backpack.contents.find((item: Item) => {
    return item.name.includes('Ingots');
  })

  if (ingots) {
    const amount = ingots.amount;
    player.moveItem(ingots, chest);
    headMsg.red(`Dropped ${amount} ingots`);
    Timer.wait(1000);
    return 'success';
  } else {
    headMsg.red(`No ingots left to drop`);
    Timer.wait(1000);
    return 'no-ingots';
  }
}

const drop_all_ingots = () => {
  dismount_beetle();
  while (drop_ingots() !== 'no-ingots') {
    continue;
  }
}

const mine_surrounding_tiles = () => {
  const offsets = [
    [-1, -1],
    [-1, -2],
    [-2, -1],
    [-2, -2],
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2],
    [1, -1],
    [2, -1],
    [1, -2],
    [2, -2],
    [-2, 0],
    [-1, 0],
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [0, 2],
    [0, -1],
    [0, -2],
    [-1, 1],
    [-1, 2],
    [-2, 2],
    [-2, 1]
  ];

  const is_full = offsets.find(([offset_x, offset_y]) => {
    const mining_result = mine(offset_x, offset_y);
    return mining_result === 'backpack-full';
  })

  return is_full ? 'backpack-full' : 'success';
}

type Coords = [number, number];

const steps = (start: Coords, destination: Coords) => {
  let delta_x = destination[0] - start[0];
  let delta_y = destination[1] - start[1];

  const result = [];

  while ((Math.abs(delta_x) + Math.abs(delta_y)) > 0) {
    if (delta_x > 0) {
      delta_x--;
      result.push(Directions.East);
    }

    if (delta_x < 0) {
      delta_x++;
      result.push(Directions.West);
    }

    if (delta_y > 0) {
      delta_y--;
      result.push(Directions.South);
    }

    if (delta_y < 0) {
      delta_y++;
      result.push(Directions.North);
    }
  }

  return result;
}

const mining_coords: Coords[] = [
  [1810, 1031],
  [1815, 1031],
  [1820, 1031],
  [1810, 1027],
  [1805, 1027],
  [1802, 1030],
  [1802, 1036],
  [1804, 1039],
  [1803, 1047],
  [1800, 1050],
  [1799, 1054],
  [1801, 1060],
  [1805, 1056],
  [1810, 1056],
  [1809, 1052],
  [1806, 1049],
  [1807, 1037],
  [1810, 1035],
]

const mined_locations: { [key: string]: any } = {};

const main = () => {
  Timer.wait(1000);
  teleport('house-mine');
  Timer.wait(1000);
  const last_coords = mining_coords.find((destination) => {
    const start: Coords = [player.x, player.y];
    const steps_to_destination = steps(start, destination);
    steps_to_destination.forEach(walk);

    const mined_locations_key = `${destination[0]},${destination[1]}`;

    const last_mined = mined_locations[mined_locations_key];

    if (last_mined) {
      const now = new Date().getTime();

      const time_since_last_mined = now - last_mined;

      const ten_minutes = 1000 * 60 * 10

      if (time_since_last_mined < ten_minutes) {
        headMsg.red('Skipping mining, last mined less than 10 mins ago');
        return false;
      } else {
        headMsg.red('Previously mined more than 10 mins ago, mining again');
      }
    } else {
      headMsg.red('Not mined this location before, mining now');
    }

    const mining_result = mine_surrounding_tiles();

    if (mining_result === 'success') {
      mined_locations[mined_locations_key] = new Date().getTime();
    }

    return mining_result === 'backpack-full';
  });
  if (last_coords) {
    headMsg.red(`Backpack full, last mined coords (${last_coords[0]}, ${last_coords[1]})`);
  } else {
    headMsg.red('Reached end of mining route');
  }
  Timer.wait(1000);
  teleport('brit-forge');
  Timer.wait(1000);
  smelt();
  Timer.wait(1000);
  teleport('house');
  Timer.wait(1000);
  walk_to_house();
  Timer.wait(1000);
  drop_all_ingots();
}

while (true) {
  main();
}
