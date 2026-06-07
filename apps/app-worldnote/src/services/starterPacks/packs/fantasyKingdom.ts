import type { StarterPack } from "../types.js";

export const FANTASY_KINGDOM_PACK: StarterPack = {
  id: "fantasy-kingdom",
  name: "The Kingdom of Eldreth",
  description:
    "A feudal fantasy realm with linked characters, places, and events ready to explore.",
  icon: "castle",
  coverFile: "fantasy-kingdom-cover.png",
  cards: [
    {
      key: "kingdom",
      cardType: "polity",
      name: "The Kingdom of Eldreth",
      position: { x: 20, y: -540 },
      subtitle: "The Crown of the North",
      tags: ["kingdom", "polity", "fantasy"],
      fields: { government_type: "Feudal Monarchy" },
      customProperties: {
        Founded: "Year 312 of the Eldreth Calendar",
        Ruler: "King Aldric III",
        Population: "240,000",
        Motto: "By Steel and Starlight",
      },
      lore: `# The Kingdom of Eldreth

Eldreth is an ancient human kingdom nestled between the Silverwood and the Greywatch mountains. For three centuries it has stood as a bulwark against the wild tribes of the eastern steppes.

## History

Founded after the War of Broken Crowns, Eldreth united the scattered baronies under a single crown. The royal line of Aldric has ruled from Castle Greywatch ever since, though the capital city of Highmoor has grown into a bustling trade hub.

## Politics

The kingdom operates on feudal oaths: barons swear fealty to the crown, and the crown protects the realm. The Silverwood elves hold autonomous rights within their forest, a treaty sealed by blood and magic generations ago.`,
    },
    {
      key: "capital",
      cardType: "location",
      name: "Highmoor",
      position: { x: -15, y: -280 },
      subtitle: "Capital of Eldreth",
      tags: ["city", "capital", "location"],
      customProperties: {
        Population: "45,000",
        Founded: "Year 340",
        Trade: "Grain, iron, wool",
      },
      lore: `# Highmoor

Highmoor rises on a limestone plateau above the River Eld, its white walls visible for miles across the northern plains. Merchants from every corner of the realm gather in the Grand Market, and the royal mint strikes coins bearing the Aldric crest.

## Notable Districts

The **Crown Quarter** holds the old palace and the Hall of Oaths. The **River Ward** is home to fishermen and tanners. The **Scholar's Row** hosts the Royal Academy, where mages and historians debate the nature of the Silverwood treaty.

## Atmosphere

By day, Highmoor hums with commerce and gossip. By night, the Gilded Griffin tavern fills with soldiers, bards, and spies trading rumors of war.`,
    },
    {
      key: "castle",
      cardType: "building",
      name: "Castle Greywatch",
      position: { x: -280, y: -40 },
      subtitle: "Seat of the Crown",
      tags: ["castle", "fortress", "building"],
      customProperties: {
        Built: "Year 315",
        Garrison: "800 soldiers",
        Walls: "Triple curtain, 40 ft high",
      },
      lore: `# Castle Greywatch

Greywatch crowns the highest spur of the Greywatch mountains, its grey granite towers cutting a jagged silhouette against the sky. The castle has never fallen to siege — though the orc warlord Gurhak came closer than any before him.

## Defenses

Three concentric walls protect the keep. The outer bailey holds stables and barracks; the middle ring contains the great hall and royal apartments; the inner keep houses the crown jewels and the royal archives.

## The Siege

In Year 891, Gurhak the Render laid siege for forty days. King Aldric III held the walls while Ser Roland led sorties that broke the orc supply lines. The siege ended when Gurhak fell in single combat at the gate — though some whisper he still walks the eastern wastes.`,
    },
    {
      key: "tavern",
      cardType: "building",
      name: "The Gilded Griffin",
      position: { x: 360, y: -50 },
      subtitle: "Where stories are born",
      tags: ["tavern", "building", "social"],
      customProperties: {
        Owner: "Marta Thornwood",
        Rooms: "12 upstairs",
        Specialty: "Honey mead and venison pie",
      },
      lore: `# The Gilded Griffin

Every adventurer in Eldreth knows the Griffin — a timber-framed tavern on Highmoor's Scholar's Row, its sign a gilded griffin rearing over a foaming tankard.

## Patrons

Knights off-duty swap war stories by the hearth. Elven envoys from Silverwood drink quietly in the corner booth. Bards compete for coin, and the rumor mill runs hotter than the kitchen fires.

## Secrets

Marta Thornwood, the sharp-eyed proprietor, hears everything. Some say she once served the crown as a spy; others say she still does.`,
    },
    {
      key: "forest",
      cardType: "location",
      name: "Silverwood",
      position: { x: -720, y: 140 },
      subtitle: "The Elven Sanctuary",
      tags: ["forest", "location", "elven"],
      customProperties: {
        Area: "12,000 acres",
        Guardians: "Silverwood Sentinels",
        Treaty: "Autonomous under Eldreth crown",
      },
      lore: `# Silverwood

Ancient oaks and silver-barked moontrees stretch unbroken for leagues west of Highmoor. The forest is home to the Dawnshard clan of wood elves, who have guarded its depths since before humans raised their first stone walls.

## The Treaty

After the Border Wars, King Aldric I granted the elves sovereignty within Silverwood in exchange for their aid against the orc hordes. The treaty holds to this day — though tensions rise whenever loggers push too close to the treeline.

## Magic

The heart of Silverwood is warded. Outsiders who wander off the King's Road report hearing songs in a language they almost understand, and waking miles from where they slept.`,
    },
    {
      key: "king",
      cardType: "character",
      name: "King Aldric III",
      position: { x: -580, y: 400 },
      subtitle: "The Iron Crown",
      tags: ["character", "royalty", "human"],
      fields: {
        gender: "male",
        race: "Human",
        start_year: 820,
        appearance:
          "Broad-shouldered, grey at the temples, a scar across his left brow from the Siege of Greywatch",
        personality:
          "Patient, duty-bound, slow to anger but relentless once committed",
      },
      customProperties: {
        Title: "King of Eldreth",
        Weapon: "Longsword *Oathkeeper*",
        Allegiance: "The Kingdom of Eldreth",
      },
      lore: `# King Aldric III

Third of his name, Aldric inherited a realm at peace and nearly lost it to Gurhak's horde. He held Castle Greywatch through forty days of siege, personally leading the defense of the gate when the outer wall fell.

## Legacy

He rebuilt the eastern marches, strengthened the Silverwood treaty, and knighted Ser Roland for valor at the siege. Some nobles whisper he should abdicate in favor of his son; Aldric listens and says nothing.

## Motivation

Aldric believes the crown exists to protect the realm — not to enrich the royal house. He sleeps little and reads dispatches by candlelight, always waiting for the next threat from the east.`,
    },
    {
      key: "knight",
      cardType: "character",
      name: "Ser Roland of Greywatch",
      position: { x: -240, y: 390 },
      subtitle: "Champion of the Crown",
      tags: ["character", "knight", "human"],
      fields: {
        gender: "male",
        race: "Human",
        start_year: 845,
        appearance:
          "Tall, sun-weathered, close-cropped brown hair, the Greywatch surcoat over plate",
        personality: "Honorable, blunt, fiercely loyal to the king and the realm",
      },
      customProperties: {
        Rank: "Knight-Captain of the Royal Guard",
        Weapon: "Warhammer *Greywatch*",
        Allegiance: "The Kingdom of Eldreth",
      },
      lore: `# Ser Roland of Greywatch

Born in Highmoor's River Ward, Roland rose from squire to Knight-Captain through skill and stubborn courage. He is the king's sworn sword and the garrison commander of Castle Greywatch.

## The Siege

During Gurhak's siege, Roland led three night sorties that burned orc supply wagons and broke their siege engines. On the fortieth day, he stood beside the king when Gurhak challenged the gate — and helped drive the warlord back into the wastes.

## Bonds

Son of King Aldric III by a earlier marriage, though Roland refuses any claim to the throne. He serves the crown, not the bloodline — a distinction that keeps court politics at bay.`,
    },
    {
      key: "elf",
      cardType: "character",
      name: "Luthien Dawnshard",
      position: { x: 100, y: 405 },
      subtitle: "Voice of the Silverwood",
      tags: ["character", "elf", "diplomat"],
      fields: {
        gender: "female",
        race: "Wood Elf",
        start_year: 780,
        appearance:
          "Slender, silver hair braided with moonvine, green eyes that catch torchlight like emeralds",
        personality:
          "Measured, witty, fiercely protective of Silverwood and its people",
      },
      customProperties: {
        Role: "Envoy to the Eldreth Court",
        Weapon: "Longbow and curved blade",
        Allegiance: "Silverwood / Dawnshard Clan",
      },
      lore: `# Luthien Dawnshard

Luthien speaks for the Silverwood elves at the court in Highmoor. She walks a narrow path between human expansion and elven isolation, negotiating logging rights, trade routes, and the occasional border skirmish.

## Skills

A master archer and diplomat, Luthien can silence a hall with a glance or charm a hostile baron over honey mead at the Gilded Griffin. She has saved the treaty twice — once with words, once with an arrow.

## Secrets

She and Ser Roland share a wary respect born at the siege, when elven scouts warned the castle of Gurhak's flanking maneuver. Whether that respect has deepened is a question Highmoor's gossips love to ask.`,
    },
    {
      key: "orc",
      cardType: "character",
      name: "Gurhak the Render",
      position: { x: 400, y: 280 },
      subtitle: "Warlord of the Eastern Wastes",
      tags: ["character", "orc", "antagonist"],
      fields: {
        gender: "male",
        race: "Orc",
        start_year: 800,
        end_year: 891,
        appearance:
          "Massive, ritual scar patterns across chest and arms, one tusk capped in iron",
        personality:
          "Savage, cunning, obsessed with breaking the 'soft kingdoms' of men",
      },
      customProperties: {
        Title: "Render of the Bone Clan",
        Weapon: "Great axe *Skullsplitter*",
        Allegiance: "Bone Clan Horde",
      },
      lore: `# Gurhak the Render

Gurhak united the Bone Clan orcs and a dozen lesser tribes under a single banner of conquest. He named himself Render — one who strips flesh from the world — and turned his horde west toward Eldreth.

## The Siege

For forty days his warriors hammered Castle Greywatch. When the outer wall cracked, Gurhak himself challenged the gate. He was driven back, wounded, and fled east — officially listed as slain at Greywatch, though no body was recovered.

## Legacy

Orc refugees still tell of Gurhak's return. Eldreth's eastern scouts report smoke on the horizon. King Aldric keeps the garrison doubled at Greywatch, and Ser Roland sleeps with his hammer within reach.`,
    },
    {
      key: "siege",
      cardType: "event",
      name: "The Siege of Castle Greywatch",
      position: { x: -130, y: 790 },
      subtitle: "Forty days that saved a kingdom",
      tags: ["event", "battle", "siege"],
      fields: {
        start_year: 891,
        end_year: 891,
      },
      customProperties: {
        Duration: "40 days",
        Outcome: "Eldreth victory; Gurhak repelled",
        Casualties: "Estimated 2,000 combined",
      },
      lore: `# The Siege of Castle Greywatch

In the spring of Year 891, Gurhak the Render brought ten thousand orcs to the walls of Greywatch. King Aldric III refused to abandon the castle, and Ser Roland organized the defense while Luthien's scouts warned of flanking maneuvers through the mountain passes.

## Turning Points

- **Day 12:** Orc siege towers burn in a night sortie led by Roland.
- **Day 28:** The outer wall breaches; fighting moves to the middle bailey.
- **Day 40:** Gurhak challenges the gate in single combat; driven back and fled east.

## Aftermath

The kingdom celebrated a miracle — but the cost was steep. Aldric greyed overnight. Roland was knighted before the army. Luthien's treaty was renewed for another generation. And Gurhak's name became a lullaby to frighten children — and a prayer to ward off war.`,
    },
  ],
  links: [
    { source: "kingdom", sourceSocket: "capital", target: "capital" },
    { source: "capital", sourceSocket: "polity", target: "kingdom" },
    { source: "castle", sourceSocket: "location", target: "capital" },
    { source: "tavern", sourceSocket: "location", target: "capital" },
    { source: "king", sourceSocket: "affiliations", target: "kingdom" },
    { source: "king", sourceSocket: "birthplace", target: "castle" },
    { source: "knight", sourceSocket: "affiliations", target: "kingdom" },
    { source: "knight", sourceSocket: "birthplace", target: "capital" },
    { source: "knight", sourceSocket: "father", target: "king", mirrorKinship: true },
    { source: "elf", sourceSocket: "birthplace", target: "forest" },
    { source: "orc", sourceSocket: "deathplace", target: "castle" },
    { source: "siege", sourceSocket: "event_location", target: "castle" },
    { source: "siege", sourceSocket: "participants", target: "king" },
    { source: "siege", sourceSocket: "participants", target: "knight" },
    { source: "siege", sourceSocket: "participants", target: "orc" },
  ],
};
