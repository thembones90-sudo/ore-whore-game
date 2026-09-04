export const CORE_AVATAR_PATHS = {
  PEON: {
    default: "/assets/characters/ORE_WHORE_CORE_AVATARS/peon-default.png",
    proud: "/assets/characters/ORE_WHORE_CORE_AVATARS/peon-proud.png",
    scared: "/assets/characters/ORE_WHORE_CORE_AVATARS/peon-scared.png",
    angry: "/assets/characters/ORE_WHORE_CORE_AVATARS/peon-angry.png",
  },
  SHADEZ: {
    default: "/assets/characters/ORE_WHORE_CORE_AVATARS/shadez-default.png",
    angry: "/assets/characters/ORE_WHORE_CORE_AVATARS/shadez-angry.png",
    stunned: "/assets/characters/ORE_WHORE_CORE_AVATARS/shadez-stunned.png",
    somber: "/assets/characters/ORE_WHORE_CORE_AVATARS/shadez-somber.png",
  },
  SYSTEM: {
    default: "/assets/characters/ORE_WHORE_CORE_AVATARS/system-default.png",
    panic: "/assets/characters/ORE_WHORE_CORE_AVATARS/system-panic.png",
    deadpan: "/assets/characters/ORE_WHORE_CORE_AVATARS/system-deadpan.png",
    glitch: "/assets/characters/ORE_WHORE_CORE_AVATARS/system-glitch.png",
  },
} as const;

export type CoreAvatarSpeaker = keyof typeof CORE_AVATAR_PATHS;
export type AvatarStateFor<S extends CoreAvatarSpeaker> = keyof typeof CORE_AVATAR_PATHS[S] & string;

export const coreAvatarPath = <S extends CoreAvatarSpeaker>(speaker:S,state:AvatarStateFor<S>="default" as AvatarStateFor<S>) =>
  CORE_AVATAR_PATHS[speaker][state] ?? CORE_AVATAR_PATHS[speaker].default;
