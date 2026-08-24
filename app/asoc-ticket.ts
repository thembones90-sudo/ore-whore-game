export const ASOC_TICKET_ID = "asoc";
export const ASOC_REQUIRED_TOOL_ID = "ultimate-machine";
export const ASOC_TICKET_CHANCE = 0.001;

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
