// Shared game metadata: regions and platform classification
// Keep this in sync with the upload page options

export type GamePlatform = 'mobile' | 'pc' | 'console' | 'controller' | 'unknown';

export const REGIONS: Record<string, string[]> = {
  // Mobile
  "BGMI": ["India"],
  "PUBG Mobile": ["Global", "EU", "NA", "SA", "APAC"],
  "PUBG KR": ["Korea", "Japan"],
  "Game for Peace": ["China"],
  "Call of Duty Mobile": ["Global"],
  "Free Fire": ["Global", "India"],
  "Apex Legends Mobile": ["Global"],

  // PC
  "Counter-Strike 2": ["Global", "EU", "NA", "Asia", "CIS"],
  "Valorant": ["Global", "NA", "EU", "APAC", "LATAM", "BR"],
  "Overwatch 2": ["Global", "Americas", "Europe", "Asia"],
  "Fortnite (PC)": ["Global", "NA-East", "NA-West", "Europe", "Asia", "Brazil", "Oceania"],
  "Apex Legends (PC)": ["Global", "NA", "EU", "Asia"],
  "Call of Duty: Warzone": ["Global", "Americas", "Europe", "Asia"],

  // Console
  "Halo Infinite": ["Global", "Xbox", "PC"],
  "Call of Duty: Modern Warfare": ["Global", "PlayStation", "Xbox"],
  "Fortnite (Console)": ["PlayStation", "Xbox", "Switch"],
  "Apex Legends (Console)": ["PlayStation", "Xbox", "Switch"],

  // Controller-focused
  "Rainbow Six Siege": ["Global", "PC", "PlayStation", "Xbox"],
  "Destiny 2": ["Global", "PC", "PlayStation", "Xbox"],
  "Battlefield 2042": ["Global", "PC", "PlayStation", "Xbox"],
};

export const PLATFORM_BY_GAME: Record<string, GamePlatform> = {
  // Mobile
  "BGMI": 'mobile',
  "PUBG Mobile": 'mobile',
  "PUBG KR": 'mobile',
  "Game for Peace": 'mobile',
  "Call of Duty Mobile": 'mobile',
  "Free Fire": 'mobile',
  "Apex Legends Mobile": 'mobile',

  // PC
  "Counter-Strike 2": 'pc',
  "Valorant": 'pc',
  "Overwatch 2": 'pc',
  "Fortnite (PC)": 'pc',
  "Apex Legends (PC)": 'pc',
  "Call of Duty: Warzone": 'pc',

  // Console
  "Halo Infinite": 'console',
  "Call of Duty: Modern Warfare": 'console',
  "Fortnite (Console)": 'console',
  "Apex Legends (Console)": 'console',

  // Controller-focused (primarily console, but can be PC too)
  "Rainbow Six Siege": 'controller',
  "Destiny 2": 'controller',
  "Battlefield 2042": 'controller',
};

export function isValidRegion(game: string, region: string): boolean {
  const allowed = REGIONS[game];
  return Array.isArray(allowed) ? allowed.includes(region) : false;
}