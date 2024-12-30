export enum MiningResult {
  fail,
  success,
  noMetal,
  backpackFull,
  cannotSee,
  unmineable,
  invalidTerrain,
}

export const MiningJournalMessages = {
  [MiningResult.fail]: "You loosen some rocks",
  [MiningResult.success]: "You dig some",
  [MiningResult.noMetal]: "There is no metal",
  [MiningResult.backpackFull]: "Your backpack is full",
  [MiningResult.cannotSee]: "Target cannot be seen",
  [MiningResult.unmineable]: "You can't mine that",
}
