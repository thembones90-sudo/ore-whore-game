import type { TrueArtifact } from "./true-artifacts.ts";

export const ASOC_TICKET_ID = "asoc";
export const ASOC_REQUIRED_TOOL_ID = "ultimate-machine";
export const ASOC_TICKET_CHANCE = 0.001;

export const ASOC_TICKET_PRESENTATION: TrueArtifact = {
  id: ASOC_TICKET_ID,
  name: "ASOC TICKET",
  announcement: "ANOMALOUS OBJECT DETECTED",
  lore: "The ultimate TRUE discovery. Entry to one game of ASOC.",
  lockedClue: "Someone is waiting for an invitation to be presented.",
  peonBark: "Me win?",
  image: "/assets/true/true-asoc-ticket.webp",
  selectionWeight: null,
  theme: "infernal",
  ultimate: true,
  instruction: "SHOW THIS TO SUMMON THE GAME MASTER",
  systemResponse: "NO. YOU HAVE BEEN INVITED.",
};

/**
 * The Golden ASOC Ticket is an ultimate-tool-only, unique roll. It is separate
 * from the ordinary TRUE Artefact pool and from Forbidden Tunnel modifiers.
 */
export const asocTicketChanceForDig = (
  equippedToolId: string,
  runCompleted: boolean,
) => equippedToolId === ASOC_REQUIRED_TOOL_ID && !runCompleted
  ? ASOC_TICKET_CHANCE
  : 0;
