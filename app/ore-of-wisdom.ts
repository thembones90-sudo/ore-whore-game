export const ORE_OF_WISDOM_CHANCE = 0.004;
export const ORE_OF_WISDOM_AFTERTHOUGHT_CHANCE = 0.125;

export const ORE_OF_WISDOM_INVOCATION =
  "OH GREAT ORE OF THE SOIL, WHAT IS YOUR WISDOM?";

export const ORE_OF_WISDOM_AFTERTHOUGHT = "Me ask rock. Rock know stuff.";

export const ORE_OF_WISDOM_QUOTES = [
  "Mercy is a luxury best afforded to defeated enemies.",
  "A necessary evil remains necessary.",
  "If the price of victory troubles you, stop counting.",
  "Never confuse cruelty with purpose. Cruelty wastes time.",
  "There is always another choice. Most of them are worse.",
  "A good man asks whether he should. A useful man asks whether it worked.",
  "The greater good becomes easier once you decide who counts.",
  "Peace is what remains when opposition becomes impractical.",
  "A hero saves everyone he can. A ruler decides who can be lost.",
  "Never destroy hope. Redirect it toward something you control.",
  "The dead rarely object to how history remembers them.",
  "Every line you refuse to cross becomes a weapon for someone who will.",
  "History forgives many things. Losing is rarely among them.",
  "When morality and survival disagree, morality has misunderstood the situation.",
  "A terrible solution remains a solution.",
  "Never mistake hesitation for morality.",
  "A monster with a purpose sleeps better than a hero with excuses.",
  "If your enemy offers peace, ask what frightened him.",
  "Power does not corrupt everyone. Some people simply needed permission.",
  "The road to damnation is paved with necessary decisions.",
  "When the world gives you two terrible choices, choose the one that leaves you in charge.",
  "The innocent are unfortunate. The useful are protected.",
  "Sometimes the only way to protect what you love is to become something it would hate.",
  "Everyone believes they have limits. Circumstances are excellent teachers.",
  "The difference between sacrifice and murder is usually a speech.",
  "A kingdom does not need a good king. It needs a surviving one.",
  "Never apologize for the cost of victory to those enjoying its benefits.",
  "The path of least resistance is easier once resistance has been removed.",
  "If the world forces you to become a monster, become a competent one.",
  "No one remembers what the right choice was. They remember who remained.",
  "Forgive your enemies. They become careless.",
  "If someone underestimates you, encourage them.",
  "Do not seek revenge while angry. Good work requires concentration.",
  "Never threaten someone. Explain what might happen.",
  "Always give people a choice. Make sure you like both answers.",
  "Being underestimated is free camouflage.",
  "The best lie contains enough truth to defend itself.",
  "Never destroy an enemy who still has useful enemies.",
  "A favor freely given is a debt poorly documented.",
  "Never reveal everything you know. Especially that.",
  "Choose your battles carefully. Then choose weaker opponents.",
  "Good manners cost nothing and conceal almost everything.",
  "Always listen carefully. People eventually explain how to manipulate them.",
  "Your enemy's enemy is not your friend. He is temporary equipment.",
  "Patience is not kindness. Sometimes you are simply waiting for better leverage.",
  "The moral high ground is useful. You can see everyone's position from there.",
  "There are two sides to every story. Control distribution of both.",
  "Loyalty is priceless. This makes it remarkably cheap to request.",
  "Trust is earned slowly and spent all at once.",
  "Leave the world better than you found it. Take the valuables.",
] as const;

export type OreOfWisdomEncounter = {
  quote: (typeof ORE_OF_WISDOM_QUOTES)[number];
  showAfterthought: boolean;
};

export function rollOreOfWisdom(
  random: () => number = Math.random,
): OreOfWisdomEncounter | null {
  if (random() >= ORE_OF_WISDOM_CHANCE) return null;
  const quoteIndex = Math.min(
    ORE_OF_WISDOM_QUOTES.length - 1,
    Math.floor(random() * ORE_OF_WISDOM_QUOTES.length),
  );
  return {
    quote: ORE_OF_WISDOM_QUOTES[quoteIndex],
    showAfterthought: random() < ORE_OF_WISDOM_AFTERTHOUGHT_CHANCE,
  };
}
