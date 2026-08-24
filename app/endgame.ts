export type LegacyAlbumSnapshot = {
  combos: Record<string, number>;
  ores: Record<string, number>;
  minerals: Record<string, number>;
};

export type CompletionRecord = {
  id: string;
  completedAt: string;
  shift: number;
  digs: number;
  strikes: number;
  playTimeMs: number;
  oresExcavated: number;
  mineralsDiscovered: number;
  uniqueSpecimens: number;
  duplicateSpecimens: number;
  perfectStrikes: number;
  criticalStrikes: number;
  misses: number;
  veinsDiscovered: number;
  forbiddenTunnelsEntered: number;
  trueArtifactsDiscovered: number;
  dustEarned: number;
  dustSpent: number;
  mostMinedOre: string;
  mostUsedPickaxe: string;
  asocTickets: number;
  legacyAlbum: LegacyAlbumSnapshot;
};

export const LAST_FIND_PAGES = [
  ["Do you remember when the circus rolled into town?", "There were no safety nets."],
  ["The price of admission was a mere drop of blood, and the ticket you received in return was never meant to be thrown away.", "It became part of the show."],
  ["Over the years, the circus wandered far beyond the borders of our little world.", "We visited strange realms, crossed impossible distances, fought monsters, became monsters, lost friends, found new ones, and somehow kept the lights burning inside our tiny pocket universe."],
  ["Some of our crew were lost to the abyss.", "Others stepped through the curtains and proved themselves worthy of standing among them, sometimes even surpassing those who came before them with their wit, skill, nobility, and an absolutely unreasonable number of terrible jokes."],
  ["And through all of it, the circus remained.", "A place built from countless hours, ridiculous adventures, laughter, arguments, victories, disasters, and memories that somehow became larger than the game that created them."],
  ["Hell of a ride.", "And now, after all this digging...", "you found the ticket again."],
  ["ASOC TICKET ACQUIRED", "The invitation remains valid."],
  ["There is nothing left for you to dig for.", "The mine is complete.", "The shift is over."],
  ["Go outside, little hero.", "And don't forget the circus.", "It just might roll back into town someday, should the winds of fortune call for its name again."],
  ["Keelah se'lai."],
] as const;

export const CREDITS = [
  ["ORE WHORE", "Compulsive Geology"],
  ["Created by", "Bojan"],
  ["Development", "Bojan + Codex"],
  ["Art Direction / Unlicensed Geological Delusions", "Bojan + Skynet"],
  ["Peon Voice", "Bojan"],
  ["Quality Assurance", "Everyone who clicked KEEP DIGGING after clearly being told not to."],
  ["Department of Mineral Affairs", "Unreachable for comment."],
  ["Employee Welfare", "Budget denied."],
  ["Specimen Dust Research Division", "They finally found a use for it."],
  ["Tunnel Safety Inspector", "Missing."],
  ["Human Resources", "Peon."],
  ["Peon Resources", "Also Peon."],
  ["NO PEONS WERE PAID DURING THE DEVELOPMENT OF THIS GAME.", "Some were given dust."],
] as const;
