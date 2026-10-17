// Six weeks of fictional notes for testing. `daysAgo` counts from the day they're loaded;
// `key` lets tests refer to a note without knowing its id.

export type SeedNote = {
  key: string;
  daysAgo: number;
  time: string; // 24-hour HH:MM, local time
  text: string;
};

export const SEED_NOTES: SeedNote[] = [
  // Week 6 (oldest)
  {
    key: 'launch-kickoff',
    daysAgo: 42,
    time: '09:10',
    text: 'First day of the Atlas launch push. Dev wants everything ready in four weeks which honestly feels impossible. Made a list on the train and it already has thirty things on it.',
  },
  {
    key: 'run-plan',
    daysAgo: 42,
    time: '19:45',
    text: 'Signed up for the city 10k in six weeks. Found a beginner plan online, three runs a week. Did the first one tonight, 3 kilometres, legs felt like wood but I finished.',
  },
  {
    key: 'mum-call-checkup',
    daysAgo: 41,
    time: '21:05',
    text: 'Called mum. She has her blood test next Thursday and is pretending she is not worried about it. I told her I would call right after.',
  },
  {
    key: 'sourdough-fail-1',
    daysAgo: 40,
    time: '12:30',
    text: 'Tried making sourdough with the starter Maya gave me. It came out flat and dense like a frisbee. Ate it anyway with butter, not bad actually.',
  },
  {
    key: 'cant-sleep-1',
    daysAgo: 40,
    time: '01:40',
    text: 'It is almost two and my brain will not shut off. Kept replaying the meeting where Dev pushed back on the timeline. Going to try reading instead of scrolling.',
  },
  {
    key: 'arjun-job-hunt',
    daysAgo: 39,
    time: '18:20',
    text: 'Arjun called, he got through to the final round at the design studio in Bangalore. He sounded nervous but excited. Told him to just be himself in the interview.',
  },
  {
    key: 'guitar-start',
    daysAgo: 38,
    time: '20:30',
    text: 'Pulled the old guitar out from under the bed. Fingertips hurt after ten minutes. Learned the G and C chords again, switching between them is so slow.',
  },
  {
    key: 'rent-increase',
    daysAgo: 37,
    time: '08:15',
    text: 'Landlord emailed, rent is going up by eight percent from next month. That is a lot. Need to sit down this weekend and look at where the money actually goes.',
  },
  {
    key: 'work-late-1',
    daysAgo: 37,
    time: '22:50',
    text: 'Left the office at ten again. Completely drained, did not even have energy to cook, just ordered noodles and stared at the wall.',
  },
  {
    key: 'priya-coffee',
    daysAgo: 36,
    time: '16:00',
    text: 'Coffee with Priya after ages. She just started at the hospital as a resident and her hours are even worse than mine. We laughed about competing over who sleeps less.',
  },
  {
    key: 'run-2',
    daysAgo: 35,
    time: '07:00',
    text: 'Morning run before work, 4 k. Cold but the sunrise over the lake was beautiful. Felt lighter for the whole morning.',
  },
  {
    key: 'budget-sunday',
    daysAgo: 35,
    time: '15:30',
    text: 'Did the budget. Food delivery is the biggest leak, way more than I thought. Setting a limit and cooking at least four nights a week. Also want to save for a new laptop by spring.',
  },

  // Week 5
  {
    key: 'mum-results-good',
    daysAgo: 34,
    time: '13:10',
    text: 'Mum got her results, everything is normal, cholesterol a little high but the doctor said diet and walking will fix it. Huge relief, I did not realise how tense I was until she told me.',
  },
  {
    key: 'meeting-dev-tension',
    daysAgo: 33,
    time: '18:40',
    text: 'Rough meeting. Dev questioned my estimates in front of the whole team. I stayed calm but I was shaking a bit after. Need to bring data next time instead of gut feelings.',
  },
  {
    key: 'biryani-attempt',
    daysAgo: 32,
    time: '21:15',
    text: 'Cooked biryani from mum’s recipe over the phone. The rice was a bit mushy but the smell filled the whole flat and made me homesick in a good way.',
  },
  {
    key: 'cant-sleep-2',
    daysAgo: 32,
    time: '02:20',
    text: 'Awake again at two. Heart racing about the launch checklist. Wrote everything down on paper to get it out of my head, that helped a little.',
  },
  {
    key: 'arjun-got-job',
    daysAgo: 31,
    time: '19:00',
    text: 'Arjun got the job at the Bangalore studio! He moves there at the end of the month. Mum cried on the call. So proud of him.',
  },
  {
    key: 'goa-idea',
    daysAgo: 30,
    time: '22:00',
    text: 'Maya suggested a long weekend in Goa after the launch, just the three of us with Priya. Something to look forward to. We picked the dates tentatively.',
  },
  {
    key: 'knee-pain',
    daysAgo: 29,
    time: '08:30',
    text: 'Left knee aches after yesterday’s 5 k. Probably went too fast downhill. Skipping today’s run and icing it. Annoying because the plan was going so well.',
  },
  {
    key: 'guitar-progress',
    daysAgo: 28,
    time: '21:40',
    text: 'Finally played a full song on guitar without stopping, slowly but still. The calluses are coming in. Twenty minutes a day is working.',
  },
  {
    key: 'overwhelmed-work',
    daysAgo: 27,
    time: '20:10',
    text: 'Feel like I am drowning. Three teams need things from me and every message starts with urgent. I could not focus on anything properly today.',
  },
  {
    key: 'walk-with-mum-call',
    daysAgo: 26,
    time: '18:00',
    text: 'Mum has started walking every evening for her cholesterol, she called mid walk to tell me she did 5000 steps. Proud of her.',
  },

  // Week 4
  {
    key: 'sourdough-success',
    daysAgo: 25,
    time: '11:45',
    text: 'Second sourdough attempt and it actually rose! Proper crust, open crumb. Took a photo and sent it to Maya who taught me. Small win.',
  },
  {
    key: 'phone-in-bed',
    daysAgo: 24,
    time: '23:30',
    text: 'New rule, the phone charges in the kitchen at night. Bought a cheap alarm clock. Lets see if I actually fall asleep faster.',
  },
  {
    key: 'launch-slip',
    daysAgo: 23,
    time: '17:20',
    text: 'The launch slipped by a week because of the payments integration. Weirdly relieved. Dev was surprisingly understanding about it.',
  },
  {
    key: 'knee-better',
    daysAgo: 22,
    time: '07:15',
    text: 'Knee feels fine again. Easy 4 k, slower pace, focused on short steps downhill. Back on the plan.',
  },
  {
    key: 'arjun-moving',
    daysAgo: 21,
    time: '20:45',
    text: 'Helped Arjun pack for Bangalore over video call, he has way too many shoes. His flat there is near the office, he can walk to work.',
  },
  {
    key: 'slept-well-1',
    daysAgo: 20,
    time: '08:00',
    text: 'Slept seven and a half hours straight. The phone in the kitchen thing might actually be working. Woke up before the alarm and felt human.',
  },
  {
    key: 'priya-tired',
    daysAgo: 20,
    time: '21:20',
    text: 'Priya messaged after a 30 hour shift, she sounded completely wiped out. Dropped some soup at her place on the way home.',
  },
  {
    key: 'money-on-track',
    daysAgo: 19,
    time: '19:30',
    text: 'Checked the budget, cooked five nights this week and stayed under the food limit. Put the savings into the laptop fund. Feels good to see it grow.',
  },
  {
    key: 'team-praise',
    daysAgo: 18,
    time: '18:10',
    text: 'Dev thanked me in the team meeting for sorting out the payments mess. Did not expect that after the last few weeks. Felt really good.',
  },
  {
    key: 'guitar-maya',
    daysAgo: 17,
    time: '22:00',
    text: 'Played guitar for Maya over dinner, very badly, but she sang along anyway. We laughed a lot. Good evening.',
  },

  // Week 3
  {
    key: 'launch-week',
    daysAgo: 16,
    time: '08:40',
    text: 'Launch week. Everything is ready except the onboarding emails. Calm but focused. Packed lunch so I do not waste time ordering.',
  },
  {
    key: 'cant-switch-off',
    daysAgo: 15,
    time: '23:50',
    text: 'Could not switch off tonight, kept checking the dashboards in my head. Read a few pages and did the breathing thing, eventually drifted off.',
  },
  {
    key: 'launch-day',
    daysAgo: 14,
    time: '19:30',
    text: 'Atlas launched today! A few small bugs but nothing serious, sign ups were double what we hoped. The whole team went for pizza. I am so tired and so happy.',
  },
  {
    key: 'arjun-moved',
    daysAgo: 13,
    time: '21:00',
    text: 'Arjun landed in Bangalore and sent a photo of his empty flat. He already found a dosa place downstairs. Mum is asking him to call every day.',
  },
  {
    key: 'rest-day',
    daysAgo: 13,
    time: '11:00',
    text: 'Slept till ten, no laptop, no messages. Lay on the sofa and watched old movies. Needed this so badly after the launch.',
  },
  {
    key: 'long-run',
    daysAgo: 12,
    time: '07:30',
    text: 'Longest run so far, 8 kilometres without stopping. Knee held up. The 10k actually feels possible now.',
  },
  {
    key: 'goa-booked',
    daysAgo: 11,
    time: '20:20',
    text: 'Booked the Goa trip with Maya and Priya for the weekend after next. Found a small guesthouse near the beach in Anjuna. Cannot wait.',
  },
  {
    key: 'empty-after-launch',
    daysAgo: 10,
    time: '22:15',
    text: 'Weird flat feeling after the launch high. Nothing urgent to do and I do not know what to do with myself. Maybe this is what rest feels like.',
  },
  {
    key: 'mum-cooking-call',
    daysAgo: 10,
    time: '13:00',
    text: 'Mum taught me her dal on a video call. Much better than my biryani attempt. She keeps saying I should visit more.',
  },

  // Week 2
  {
    key: 'race-day',
    daysAgo: 9,
    time: '10:30',
    text: 'Ran the 10k! 58 minutes, under an hour which was the goal. Maya came to cheer at the finish line with a sign. Legs are destroyed, heart is full.',
  },
  {
    key: 'post-race-sore',
    daysAgo: 8,
    time: '09:00',
    text: 'Walking downstairs is a comedy show today, everything is sore. Worth it. Already thinking about a half marathon which is probably a terrible idea.',
  },
  {
    key: 'priya-doubts',
    daysAgo: 8,
    time: '21:30',
    text: 'Long call with Priya, she is questioning whether medicine is right for her after a really bad week. Mostly just listened. She has been carrying a lot.',
  },
  {
    key: 'new-project',
    daysAgo: 7,
    time: '17:45',
    text: 'Dev asked me to lead the next project, a redesign of the reporting tools. Nervous but flattered. Want to set better boundaries this time, no ten pm nights.',
  },
  {
    key: 'laptop-bought',
    daysAgo: 6,
    time: '19:10',
    text: 'Bought the new laptop with the money I saved from cooking at home. First thing I have saved up for properly in a while.',
  },
  {
    key: 'packing-goa',
    daysAgo: 5,
    time: '22:40',
    text: 'Packing for Goa. Sunscreen, books, the old guitar maybe. Priya says she is going to sleep the whole time and I believe her.',
  },

  // Week 1 (most recent)
  {
    key: 'goa-arrival',
    daysAgo: 4,
    time: '18:30',
    text: 'Made it to Goa. The guesthouse is tiny and lovely, you can hear the waves from the room. Sat on the beach with Maya and Priya until the sun went down.',
  },
  {
    key: 'goa-beach-day',
    daysAgo: 3,
    time: '20:00',
    text: 'Lazy beach day, swam twice, ate way too much fish curry. Priya slept on the sand for two hours. First time in months I did not think about work at all.',
  },
  {
    key: 'goa-talk',
    daysAgo: 3,
    time: '23:15',
    text: 'Late night talk on the balcony. Priya decided to stay in medicine but switch to a calmer specialty. Maya is thinking of moving to Bangalore too, near Arjun.',
  },
  {
    key: 'back-home',
    daysAgo: 2,
    time: '21:00',
    text: 'Back home. The flat feels quiet. Unpacked, did laundry, already miss the sound of the sea. Calling mum tomorrow to tell her about the trip.',
  },
  {
    key: 'mum-visit-plan',
    daysAgo: 1,
    time: '19:20',
    text: 'Told mum about Goa. She made me promise to visit home next month. Arjun might fly in too, all of us together for the first time in a year.',
  },
  {
    key: 'reflection',
    daysAgo: 1,
    time: '22:30',
    text: 'Looking back at the last month and a half, a lot changed. The launch went well, I finished the 10k, I am sleeping better and saving money. Feeling more like myself.',
  },
];

// Sample note ids start here, far above real notes.
export const SEED_ID_BASE = 1_000_000;

export function seedId(key: string): number {
  const index = SEED_NOTES.findIndex((note) => note.key === key);
  if (index === -1) throw new Error(`Unknown sample note: ${key}`);
  return SEED_ID_BASE + index;
}
