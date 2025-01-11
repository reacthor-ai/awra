import { parseString } from 'xml2js';
import type { CongressData, CongressState, RSSFeed, RSSItem, TimelineEvent, VotesToday } from '@/types/feed'
import { format, formatDistanceToNow, isToday } from "date-fns";
import { getBills } from "@/api/external/bill/get-bills";

export async function getHouseFeed(): Promise<CongressData> {
  try {
    const [response, responseBills] = await Promise.all([
      fetch('https://clerk.house.gov/Home/Feed', {
        next: {revalidate: 300}
      }),
      getBills(process.env.CONGRESS_GOV_API_KEY as string, {})
    ]);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    const parseXml = (): Promise<RSSFeed> => new Promise((resolve, reject) => {
      parseString(xmlText, (err, result) => {
        if (err) reject(err);
        else resolve(result as RSSFeed);
      });
    });

    const result = await parseXml();
    const items = result.rss.channel[0].item;

    const getStatus = (): CongressState['status'] => {
      const lastAction = items[0].description[0];
      if (lastAction.includes('adjourned')) return 'Adjourned';
      if (lastAction.includes('recess')) return 'In Recess';
      return 'In Session';
    };

    const getCurrentDebate = (): string => {
      const debateItem = items.find(item =>
        item.description[0].includes('DEBATE') ||
        item.description[0].includes('Considered')
      );
      if (!debateItem) return 'No current debate';
      return debateItem.description[0]
        .replace('DEBATE - ', '')
        .replace('Considered ', '');
    };

    const getVotesToday = (): VotesToday => {
      const completedVotes = items.filter(item =>
        item.description[0].includes('Passed') ||
        item.description[0].includes('Agreed to')
      ).length;

      const scheduledVotes = items.filter(item =>
        item.description[0].includes('postponed')
      ).length;

      return {completed: completedVotes, scheduled: scheduledVotes};
    };

    // Process member presence
    const getMemberPresence = () => {
      const voteItem = items.find(item =>
        item.description[0].includes('Yeas and Nays:')
      );

      if (voteItem) {
        const match = voteItem.description[0].match(/(\d+)\s*-\s*(\d+)(?:,\s*(\d+)\s*Present)?/);
        if (match) {
          const yeas = parseInt(match[1]);
          const nays = parseInt(match[2]);
          const present = match[3] ? parseInt(match[3]) : 0;
          return {present: yeas + nays + present, total: 435};
        }
      }
      return {present: 0, total: 435};
    };

    const getSchedule = (): TimelineEvent[] => {
      const schedule = items.map((item: RSSItem) => {
        const pubDate = new Date(item.pubDate[0]);
        const time = pubDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        let description = item.description[0];
        let title = description;

        const categoryMatch = description.match(/^([A-Z\s]+)-\s*(.*)/);
        if (categoryMatch) {
          title = categoryMatch[1].trim();
          description = categoryMatch[2].trim();
        } else {
          const patterns = [
            {regex: /^(The House \w+)/, key: 'House Status'},
            {regex: /^(Motion to \w+)/, key: 'Motion'},
            {regex: /^(SPECIAL ORDER SPEECHES)/, key: 'Special Order'},
            {regex: /^(ONE MINUTE SPEECHES)/, key: 'One Minute Speeches'},
            {regex: /^(PLEDGE OF ALLEGIANCE)/, key: 'Pledge'},
          ];

          for (const pattern of patterns) {
            const match = description.match(pattern.regex);
            if (match) {
              title = pattern.key;
              break;
            }
          }
        }

        return {
          time,
          title,
          description,
          lastModified: formatDistanceToNow(pubDate, {addSuffix: true}),
          pubDate,
          dateStatus: ''
        };
      }).sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`);
        const timeB = new Date(`1970/01/01 ${b.time}`);
        return timeB.getTime() - timeA.getTime();
      });

      if (schedule.length > 0) {
        const firstItemDate = new Date(schedule[0].pubDate);
        const isFirstToday = isToday(firstItemDate);

        const firstItemDateString = isFirstToday
          ? 'Today'
          : format(firstItemDate, 'EEEE, MMMM d, yyyy');

        schedule[0].dateStatus = firstItemDateString;
      }

      return schedule;
    };

    const memberPresence = getMemberPresence();

    return {
      currentState: {
        congress: responseBills.bills[0].congress,
        session: "First",
        status: getStatus(),
        currentDebate: getCurrentDebate(),
        votesToday: getVotesToday(),
        membersPresent: memberPresence.present,
        totalMembers: memberPresence.total
      },
      schedule: getSchedule()
    };

  } catch (error) {
    console.error('Error fetching congress data:', error);
    throw error;
  }
}