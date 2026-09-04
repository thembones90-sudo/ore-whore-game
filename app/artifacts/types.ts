export type ArtifactRole =
  | "ARTIFACT"
  | "GUEST"
  | "FINAL";

export type ArtifactSpeaker = "PEON" | "SYSTEM" | "FOREMAN" | "VOICE";

type ArtifactAvatarSpeaker = "PEON" | "SYSTEM" | "SHADEZ";
type ArtifactAvatarState<S extends ArtifactSpeaker> = S extends "VOICE"
  ? never
  : AvatarStateFor<S extends "FOREMAN" ? "SHADEZ" : Extract<S,ArtifactAvatarSpeaker>>;

type ArtifactDialogueStep = {
  [S in ArtifactSpeaker]: { type:"dialogue"; speaker:S; text:string; avatarState?:ArtifactAvatarState<S> }
}[ArtifactSpeaker];

type ArtifactCharacterActionStep = {
  [S in Exclude<ArtifactSpeaker,"VOICE">]: { type:"characterAction"; character:S; action:string; avatarState?:ArtifactAvatarState<S> }
}[Exclude<ArtifactSpeaker,"VOICE">];

export type ArtifactEligibilityContext = Readonly<Record<string, unknown>>;

export type ArtifactPresentationMetadata = {
  variant: "memorial";
  subtitle?: string;
  closingLines?: readonly string[];
};

export type ArtifactSequenceStep =
  | ArtifactDialogueStep
  | { type: "pause"; durationMs: number }
  | { type: "sound"; soundId: string }
  | { type: "visual"; visualId: string }
  | ArtifactCharacterActionStep
  | { type: "stateMutation"; key: string; value: unknown }
  | { type: "achievement"; achievementId: string };

export type Artifact = {
  id: string;
  role: ArtifactRole;
  name: string;
  displayName: string;
  image: string;
  cabinetText: string;
  achievementId: string;
  selectionWeight: number;
  setId?: string;
  eligibility?: (context: ArtifactEligibilityContext) => boolean;
  discoverySequence: readonly ArtifactSequenceStep[];
  presentation?: ArtifactPresentationMetadata;
};
import type { AvatarStateFor } from "../avatar-states";
