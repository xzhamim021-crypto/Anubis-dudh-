export interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface AboutMe {
  myName: string;
  dadName: string;
  momName: string;
  age: string;
}

export interface AISettings {
  anubisAvatarUrl: string;
  hamimPicUrl: string;
}

export interface SiteSettings {
  siteName: string;
  siteTitle: string;
  bio: string;
  fontFamily: 'Inter' | 'Space Grotesk' | 'Playfair Display' | 'JetBrains Mono';
  themeAccent: 'rose' | 'cyan' | 'violet' | 'emerald' | 'amber';
  videoUrl: string;
  audioUrl: string;
  audioTitle: string;
  audioArtist: string;
  floatingQuotes: string[];
  socialLinks: SocialLink[];
  memories: Memory[];
  adminPasscode: string;
  spotifyPlaylists?: string[]; // Optional Spotify embed integration
  aboutMe?: AboutMe;
  aiSettings?: AISettings;
}
