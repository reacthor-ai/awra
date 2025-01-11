export interface RSSItem {
  guid: [{ _: string }];
  title: string[];
  description: string[];
  pubDate: string[];
  'a10:link': [{ $: { href: string } }];
  'a10:updated': string[];
}

export interface RSSFeed {
  rss: {
    channel: [{
      title: string[];
      link: string[];
      description: string[];
      item: RSSItem[];
    }];
  };
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  lastModified: string
  dateStatus: any
}

export interface VotesToday {
  completed: number;
  scheduled: number;
}

export interface CongressState {
  congress: number;
  session: string;
  status: 'Adjourned' | 'In Recess' | 'In Session';
  currentDebate: string;
  votesToday: VotesToday;
  membersPresent: number;
  totalMembers: number;
}

export interface CongressData {
  currentState: CongressState;
  schedule: TimelineEvent[];
}
