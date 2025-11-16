export interface YouTubeChannel {
  id: string;
  label: string;
  platform: 'ps' | 'xbox' | 'nintendo' | 'other';
}

export const YT_CHANNELS: YouTubeChannel[] = [
  {
    id: 'UC-2Y8dQb0S6DtpxNgAKoJKA',
    label: 'PlayStation',
    platform: 'ps',
  },
  {
    id: 'UCjBp_7RuDBUYbd1LegWEJ8g',
    label: 'Xbox',
    platform: 'xbox',
  },
  {
    id: 'UCGIY_O-8vW4rfX98KlMkvRg',
    label: 'Nintendo',
    platform: 'nintendo',
  },
];
