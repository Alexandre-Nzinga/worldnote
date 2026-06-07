import type { StarterPack } from "../types.js";

export const SCI_FI_FRONTIER_PACK: StarterPack = {
  id: "sci-fi-frontier",
  name: "The Helion Frontier",
  description:
    "A linked sci-fi setting with stars, planets, starships, and factions ready to explore.",
  icon: "rocket_launch",
  coverFile: "sci-fi-frontier-cover.png",
  cards: [
    {
      key: "star",
      cardType: "star",
      name: "Helios Prime",
      position: { x: 20, y: -540 },
      subtitle: "Anchor of the Concord",
      tags: ["star", "system", "sci-fi"],
      fields: { spectral_class: "G2V" },
      customProperties: {
        Age: "4.6 billion years",
        Luminosity: "1.02 solar",
        Planets: "6 confirmed",
      },
      lore: `# Helios Prime

Helios Prime is a stable yellow dwarf at the heart of the Concord's core systems. Its warm light bathes three habitable worlds and a ring of orbital stations that have carried human civilization across two centuries of expansion.

## The System

Inner rocky worlds were mined bare in the first wave of colonization. The middle band holds Solaris Prime and Helion-IV — the political and industrial poles of the frontier. Outer gas giants host refueling skims and deep-space listening arrays.

## Navigation

Concord charts mark Helios Prime as Sector Zero. Every jump lane, courier route, and distress beacon in the frontier is measured from this star.`,
    },
    {
      key: "homeworld",
      cardType: "planet",
      name: "Solaris Prime",
      position: { x: -15, y: -280 },
      subtitle: "Seat of the Solaran Concord",
      tags: ["planet", "homeworld", "sci-fi"],
      fields: { planet_type: "Terrestrial" },
      customProperties: {
        Population: "2.1 billion",
        Gravity: "1.02 g",
        Atmosphere: "Breathable, nitrogen-oxygen",
      },
      lore: `# Solaris Prime

Solaris Prime is the cradle world of the Solaran Concord — a blue-green planet of continental archipelagos, megacity sprawl, and orbital elevators that stitch the sky to the ground.

## New Meridian

The capital arcology of New Meridian rises above the equatorial sea, its towers linked by skybridges and mag-rail spines. The Concord Senate meets here, and the Navy's admiralty broadcasts orders to every frontier sector.

## Culture

Solaris Prime values stability, protocol, and the idea that the frontier must be governed, not abandoned. Its citizens speak Standard with a clipped, formal cadence that frontier pilots love to mock — and secretly imitate when hailing Navy patrols.`,
    },
    {
      key: "frontier",
      cardType: "planet",
      name: "Helion-IV",
      position: { x: 360, y: -50 },
      subtitle: "The contested rim",
      tags: ["planet", "colony", "frontier", "sci-fi"],
      fields: { planet_type: "Desert terrestrial" },
      customProperties: {
        Population: "180,000",
        Gravity: "0.94 g",
        Atmosphere: "Thin; domed settlements",
      },
      lore: `# Helion-IV

Helion-IV is a rust-red frontier world on the edge of charted space — a planet of dust storms, buried ice, and domed mining towns that cling to the night side's cooler basins.

## The Rim

Prospectors came for helium-3 and rare isotopes locked in the regolith. When the Void Collective began raiding convoys, Helion-IV became a flashpoint: the Concord sent Aegis Station and the fleet, and the miners learned to sleep with one ear on the proximity alarms.

## Life on the Ground

Frontier towns trade in salvage, spare parts, and rumors. Everyone knows Captain Mara Venn's *Stellar Horizon* by sight — and everyone has a story about the day the Collectors came out of the dark.`,
    },
    {
      key: "collective",
      cardType: "organization",
      name: "Void Collective",
      position: { x: 540, y: 400 },
      subtitle: "Rim raiders and separatists",
      tags: ["organization", "antagonist", "sci-fi"],
      customProperties: {
        Territory: "Uncharted slipstream lanes",
        Leader: "The Harrow",
        Methods: "Convoy raids, station strikes, propaganda",
      },
      lore: `# Void Collective

The Void Collective is not a navy — it is a movement with guns. Exiles, smugglers, and rim zealots fly under its banner, united by hatred of Concord taxes and the belief that the frontier belongs to those tough enough to hold it.

## Structure

Cells operate independently until the Harrow calls a strike. Ships like the *Harrow's Wake* serve as rally points. No Senate, no capital — only encrypted channels and the promise that the core worlds will bleed for every meter of rim they claim.

## Helion-IV

The Collective chose Helion-IV to prove a point: the Concord's farthest colonies are not safe. The battle ended in retreat, not defeat — and the Harrow's message still circulates on miner nets.`,
    },
    {
      key: "station",
      cardType: "building",
      name: "Aegis Station",
      position: { x: -280, y: -40 },
      subtitle: "Orbital command above Helion-IV",
      tags: ["station", "structure", "military", "sci-fi"],
      customProperties: {
        Orbit: "Low polar orbit, Helion-IV",
        Crew: "1,200",
        Role: "Fleet command and sensor array",
      },
      lore: `# Aegis Station

Aegis Station hangs above Helion-IV like a blade in the sky — a Concord Navy orbital fortress bristling with docking arms, long-range sensors, and the kind of quiet discipline that makes frontier pilots nervous.

## Command

Admiral Kira Solano runs the station and the Helion sector fleet from the ops deck. From here she tracks slipstream traffic, authorizes convoy escorts, and decides when a blip on the scope is a smuggler, a refugee, or something worse.

## The Array

Aegis's deep-space array caught the first anomalous signatures that preceded the Battle of Helion-IV. Solano's analysts still argue whether the Collectors were probing defenses or declaring war.`,
    },
    {
      key: "capital",
      cardType: "location",
      name: "New Meridian",
      position: { x: -720, y: 140 },
      subtitle: "Capital arcology of Solaris Prime",
      tags: ["city", "capital", "location", "sci-fi"],
      customProperties: {
        Population: "48 million",
        Districts: "Senate Spire, Dock Ring, Scholar Quarter",
        Founded: "Year 1, Concord Calendar",
      },
      lore: `# New Meridian

New Meridian is the crown of Solaris Prime — a vertical city of glass, carbon weave, and public gardens suspended between towers that disappear into cloud.

## Senate Spire

The Concord Senate debates frontier policy here, balancing expansion against the cost of Navy deployments. Every major fleet order passes through these halls before it reaches Aegis Station.

## Dock Ring

Commercial shuttles and diplomatic couriers crowd the outer ring. Off-duty Navy officers drink at the *Zero Gavel* — a bar where captains swap stories and admirals pretend not to listen.`,
    },
    {
      key: "concord",
      cardType: "polity",
      name: "Solaran Concord",
      position: { x: -580, y: 400 },
      subtitle: "Unified human stellar government",
      tags: ["polity", "government", "sci-fi"],
      fields: { government_type: "Federal Republic" },
      customProperties: {
        Founded: "Year 0, Concord Calendar",
        Capital: "New Meridian, Solaris Prime",
        Motto: "Beyond the sun, together",
      },
      lore: `# Solaran Concord

The Solaran Concord unites the core human systems under a federal republic — a senate on Solaris Prime, regional governors on member worlds, and a Navy sworn to keep the slipstream lanes open.

## Expansion Doctrine

The Concord claims it brings law to the frontier: standardized trade, rescue treaties, and protection from pirates. Critics on Helion-IV say it brings taxes, inspections, and admirals who have never slept in a dust dome.

## The Navy

Concord Navy Fleet Command reports to the Senate but answers to admirals like Kira Solano in the field. When the Void Collective escalated raids on Helion-IV, the Concord stopped debating and started deploying.`,
    },
    {
      key: "navy",
      cardType: "organization",
      name: "Concord Navy Fleet Command",
      position: { x: -240, y: 390 },
      subtitle: "Arms of the Solaran Concord",
      tags: ["organization", "military", "fleet", "sci-fi"],
      customProperties: {
        Headquarters: "Aegis Station",
        "Active vessels": "~340",
        Commander: "Admiral Kira Solano",
      },
      lore: `# Concord Navy Fleet Command

Fleet Command is the Concord's fist in the void — carrier groups, patrol frigates, and the logistics spine that keeps frontier colonies supplied across light-minutes of empty space.

## Doctrine

The Navy prioritizes convoy protection, station defense, and rapid response to slipstream distress calls. Captains like Mara Venn are granted wide autonomy on the rim, but admirals expect detailed after-action reports — especially when shots are fired.

## Helion Deployment

After repeated Void Collective raids, Fleet Command reinforced Aegis Station and assigned the *Stellar Horizon* to lead frontier reconnaissance. Solano's orders were simple: hold Helion-IV and identify the enemy's staging ground.`,
    },
    {
      key: "captain",
      cardType: "character",
      name: "Captain Mara Venn",
      position: { x: 100, y: 405 },
      subtitle: "Commander of the Stellar Horizon",
      tags: ["character", "captain", "human", "sci-fi"],
      fields: {
        gender: "female",
        race: "Human",
        start_year: 3180,
        appearance:
          "Lean, close-cropped black hair, neural interface scar behind left ear, Concord dress blues when on station",
        personality:
          "Calm under fire, skeptical of bureaucracy, fiercely protective of her crew",
      },
      customProperties: {
        Rank: "Captain",
        Ship: "CSV Stellar Horizon",
        Allegiance: "Solaran Concord / Concord Navy",
      },
      lore: `# Captain Mara Venn

Mara Venn commands the CSV *Stellar Horizon*, a Concord reconnaissance cruiser assigned to the Helion sector. She earned her captain's bars clearing pirate nests in the outer belt — and her reputation refusing orders she considered wasteful of lives.

## The Frontier

Venn knows Helion-IV's domes and dust lanes better than most admirals. She trades spare parts with miners, shares coffee with dock hands on Aegis Station, and flies the *Horizon* like an extension of her own nervous system.

## The Battle

When Void Collective raiders jumped into Helion-IV space, Venn was the first to engage. Her wing of *Viper* interceptors held the line until Solano's fleet arrived — but the Collectors left a question behind: who is pulling their strings?`,
    },
    {
      key: "admiral",
      cardType: "character",
      name: "Admiral Kira Solano",
      position: { x: 400, y: 280 },
      subtitle: "Sector commander, Aegis Station",
      tags: ["character", "admiral", "human", "sci-fi"],
      fields: {
        gender: "female",
        race: "Human",
        start_year: 3145,
        appearance:
          "Silver-streaked hair, sharp features, Concord white-and-gold admiralty uniform",
        personality:
          "Strategic, composed, willing to spend ships to save a colony",
      },
      customProperties: {
        Rank: "Admiral",
        Command: "Helion Sector / Aegis Station",
        Allegiance: "Solaran Concord / Concord Navy",
      },
      lore: `# Admiral Kira Solano

Kira Solano holds the Helion sector for the Concord Navy from Aegis Station. She survived three frontier campaigns before the Senate gave her a star — and the unenviable job of securing a planet the miners love and the Senate undervalues.

## Command Style

Solano runs tight schedules and open channels. She trusts captains who bring her bad news early and punishes officers who polish reports until the truth rusts. Venn is one of the few she calls by first name.

## After Helion-IV

The Battle of Helion-IV was a Concord victory on paper. Solano knows better: the Void Collective retreated in order, and their commander — known only as the Harrow — transmitted a single message before jumping away: *"The rim is not yours."*`,
    },
    {
      key: "harrow",
      cardType: "character",
      name: "The Harrow",
      position: { x: -130, y: 790 },
      subtitle: "Warlord of the Void Collective",
      tags: ["character", "antagonist", "sci-fi"],
      fields: {
        gender: "x",
        race: "Unknown",
        start_year: 3160,
        appearance:
          "Never seen clearly — encrypted vox, armored void-suit on grainy raid footage",
        personality:
          "Patient, theatrical, treats raids like sermons to the Concord",
      },
      customProperties: {
        Title: "Voice of the Void Collective",
        Ship: "NV Harrow's Wake",
        Allegiance: "Void Collective",
      },
      lore: `# The Harrow

The Harrow is the face — or voice — of the Void Collective, a loose alliance of raiders, exiles, and true believers who reject Concord jurisdiction on the rim. No confirmed photograph exists. Every raid leaves the same signature: a distorted vox laugh and ships that jump away on routes Navy charts say are impossible.

## Philosophy

Collective propaganda calls the Concord a cage built from treaties and taxes. The Harrow promises the frontier freedom at the cost of order — and targets convoys, stations, and symbols of Solaran unity.

## Helion-IV

At the Battle of Helion-IV, the Harrow led from the *Harrow's Wake*, a heavy raider cruiser that shrugged off frigate fire long enough to cripple two miners' tugs. Venn drove them off. Solano marked the ship for priority hunt. Neither believes they have seen the last of that voice.`,
    },
    {
      key: "flagship",
      cardType: "vehicle",
      name: "CSV Stellar Horizon",
      position: { x: 680, y: 320 },
      subtitle: "Concord reconnaissance cruiser",
      tags: ["starship", "vehicle", "sci-fi"],
      fields: {
        sub_type: "spaceship",
        max_speed: "0.18c cruise / slipstream transit",
      },
      customProperties: {
        Class: "Reconnaissance cruiser",
        Crew: "180",
        Armament: "Rail batteries, missile bays, Viper wing (6)",
      },
      lore: `# CSV Stellar Horizon

The *Stellar Horizon* is Captain Mara Venn's ship — a long-hulled Concord cruiser built for extended patrols, sensor sweeps, and the kind of independent action the rim demands.

## Layout

Forward decks hold the bridge and tactical ops. Midships carry the Viper launch tubes. Aft sections house engineering and the slipstream drive that makes sector-to-sector transit possible — when the drive cooperates.

## Service Record

The *Horizon* cleared three pirate dens, escorted forty-two convoys, and took hull scars at Helion-IV that the Navy yard on Aegis Station is still debating how to buff out. Venn's crew would not trade her for a dreadnought.`,
    },
    {
      key: "fighter",
      cardType: "vehicle",
      name: "CNV Viper Mark VII",
      position: { x: 720, y: 520 },
      subtitle: "Concord Navy interceptor",
      tags: ["starship", "vehicle", "fighter", "sci-fi"],
      fields: {
        sub_type: "spaceship",
        max_speed: "0.25c burst",
      },
      customProperties: {
        Class: "Short-range interceptor",
        Crew: "1 pilot",
        Armament: "Pulse cannons, smart missiles",
      },
      lore: `# CNV Viper Mark VII

The Viper Mark VII is the Concord Navy's standard interceptor — a compact frame, oversized engines, and just enough shielding to survive the first pass.

## Deployment

Vipers launch from cruisers like the *Stellar Horizon* and carrier decks across the fleet. At Helion-IV, Venn's wing broke a Collective flanking run while the *Horizon* locked down the raider flagship.

## Pilot Culture

Viper jocks name their ships, paint kill marks under the canopy, and pretend admirals don't notice. The best transfer to captains' staffs. The rest keep flying because the void is honest in ways people are not.`,
    },
    {
      key: "raider",
      cardType: "vehicle",
      name: "NV Harrow's Wake",
      position: { x: 400, y: 620 },
      subtitle: "Void Collective heavy raider",
      tags: ["starship", "vehicle", "antagonist", "sci-fi"],
      fields: {
        sub_type: "spaceship",
        max_speed: "0.16c cruise / anomalous slipstream",
      },
      customProperties: {
        Class: "Heavy raider cruiser",
        Crew: "Unknown (~90 estimated)",
        Armament: "Modded naval rails, boarding pods, ECM suite",
      },
      lore: `# NV Harrow's Wake

The *Harrow's Wake* is the Void Collective's most feared hull — a patchwork cruiser of stolen Navy plates, miner tug engines, and electronics that shouldn't work together but do.

## Signature

Sensor techs describe its drive signature as "wrong" — jumps that leave ghost returns on Aegis arrays and routes that skip predictable re-entry points. The Harrow uses that uncertainty as a weapon.

## Helion-IV

At the battle, the *Wake* absorbed fire that should have dropped shields and still transmitted the Harrow's message before vanishing. Venn tagged it with a tracking drone. Solano's analysts lost the signal four hours later, somewhere outside charted slipstream lanes.`,
    },
    {
      key: "battle",
      cardType: "event",
      name: "Battle of Helion-IV",
      position: { x: 200, y: 900 },
      subtitle: "The day the rim answered back",
      tags: ["event", "battle", "sci-fi"],
      fields: {
        start_year: 3217,
        end_year: 3217,
      },
      customProperties: {
        Duration: "6 hours",
        Outcome: "Concord tactical victory; Collective withdrew",
        Casualties: "Concord: 47 KIA; Collective: unknown",
      },
      lore: `# Battle of Helion-IV

In 3217, Void Collective forces jumped into Helion-IV space without warning — targeting a helium convoy and Aegis Station's sensor array in a coordinated strike.

## Timeline

- **Hour 0:** Anomalous slipstream signatures detected; Captain Venn's *Stellar Horizon* scrambles from patrol.
- **Hour 1:** Viper wing engages raider escorts; two mining tugs lost.
- **Hour 3:** Admiral Solano commits Fleet Command reserves; *Harrow's Wake* identified on primary channel.
- **Hour 5:** Venn's cruisers force the Collective flagship to break orbit; the Harrow transmits *"The rim is not yours"* and jumps away.
- **Hour 6:** Helion-IV domes hold; convoy partial recovery; Aegis array damaged but operational.

## Aftermath

The Senate declared victory. Solano reclassified the Void Collective from nuisance to strategic threat. Venn received a commendation and a quiet order: find where the *Harrow's Wake* goes when the charts run out.`,
    },
  ],
  links: [
    { source: "homeworld", sourceSocket: "orbits_star", target: "star" },
    { source: "frontier", sourceSocket: "orbits_star", target: "star" },
    { source: "concord", sourceSocket: "homeworld", target: "homeworld" },
    { source: "concord", sourceSocket: "capital", target: "capital" },
    { source: "capital", sourceSocket: "planet", target: "homeworld" },
    { source: "capital", sourceSocket: "polity", target: "concord" },
    { source: "station", sourceSocket: "location", target: "frontier" },
    { source: "navy", sourceSocket: "polity", target: "concord" },
    { source: "navy", sourceSocket: "headquarters", target: "station" },
    { source: "captain", sourceSocket: "affiliations", target: "navy" },
    { source: "captain", sourceSocket: "birthplace", target: "homeworld" },
    { source: "admiral", sourceSocket: "affiliations", target: "navy" },
    { source: "admiral", sourceSocket: "birthplace", target: "capital" },
    { source: "harrow", sourceSocket: "affiliations", target: "collective" },
    { source: "harrow", sourceSocket: "birthplace", target: "frontier" },
    { source: "flagship", sourceSocket: "manufacturer", target: "navy" },
    { source: "flagship", sourceSocket: "operator", target: "navy" },
    { source: "fighter", sourceSocket: "manufacturer", target: "navy" },
    { source: "fighter", sourceSocket: "operator", target: "navy" },
    { source: "raider", sourceSocket: "operator", target: "collective" },
    { source: "battle", sourceSocket: "event_location", target: "frontier" },
    { source: "battle", sourceSocket: "participants", target: "captain" },
    { source: "battle", sourceSocket: "participants", target: "admiral" },
    { source: "battle", sourceSocket: "participants", target: "navy" },
    { source: "battle", sourceSocket: "participants", target: "collective" },
    { source: "battle", sourceSocket: "participants", target: "harrow" },
  ],
};
