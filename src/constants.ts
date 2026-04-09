import type { Sermon, Leader } from './types';

import mum       from './assets/mum.jpg';
import choir     from './assets/worship.jpg';
import dad       from './assets/dad.jpg';
import dadandmum from './assets/dadandmum.jpg';
import encounter from './assets/encounter.jpg';
//import mummy     from './assets/mummy.jpg';
import preach    from './assets/preach.jpg';

export const CHURCH_NAME = "Global Flame Ministry";

export const NAV_LINKS = [
  { name: 'Home',       path: '/' },
  { name: 'About',      path: '/about' },
  { name: 'Sermons',    path: '/sermons' },
  { name: 'Events',     path: '/events' },
  { name: 'Ministries', path: '/ministries' },
  { name: 'Contact',    path: '/contact' },
];

export const LATEST_SERMONS: Sermon[] = [
  {
    id: 's1',
    title: 'Sounds Of the Spirit (Day 4)',
    speaker: 'Apostle Danjuma Musa',
    date: 'Oct 22, 2023',
    series: 'Firm Foundation',
    imageUrl: preach,
    videoUrl: 'https://www.youtube.com/embed/2Pju0LecOJ0?si=jADu39Z2_noSjE5p',
    description: 'Discover how to stand firm when everything around you seems uncertain.',
  },
  {
    id: 's2',
    title: 'KAINOS: To make all men see',
    speaker: 'Apostle Danjuma Musa',
    date: 'Oct 15, 2023',
    series: 'Kingdom Mandate',
    imageUrl: mum,
    videoUrl: 'https://www.youtube.com/embed/2Pju0LecOJ0?si=jADu39Z2_noSjE5p',
    description: 'Understanding the biblical mandate to compel them to see.',
  },
  {
    id: 's3',
    title: 'The Divine Encounter',
    speaker: 'Apostle Danjuma Musa',
    date: 'Oct 08, 2023',
    series: 'Revival',
    imageUrl: encounter,
    videoUrl: 'https://www.youtube.com/embed/mSr-PgheYvE?si=Oesxm8vuDJhVo4qk',
    description: 'Leave the past behind and step into the new season God has prepared.',
  },
];

export const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Night of Worship",
    category: "Worship Experience",
    date: "November 12, 2026",
    time: "7:00 PM",
    location: "Global Flame Auditorium",
    description: "An evening dedicated to profound praise and communal prayer.",
    imageUrl: preach,
  },
  {
    id: 2,
    title: "Community Outreach",
    category: "Global Impact",
    date: "November 18, 2026",
    time: "9:00 AM",
    location: "Metadodium Center",
    description: "Serving our city through grace and action.",
    imageUrl: encounter,
  },
  {
    id: 3,
    title: "Youth Fall Retreat",
    category: "Next Gen",
    date: "November 25 — 31, 2026",
    time: "All Weekend",
    location: "Camp Pines",
    description: "A transformative weekend for grades 6-12.",
    imageUrl: choir,
  },
];

export const LEADERS: Leader[] = [
  {
    id: 'l1',
    name: 'Apostle Danjuma & Faith Musa',
    role: 'Senior Pastors',
    imageUrl: dadandmum,
    bio: 'Apostle Danjuma and Apostle Faith lead Global Flame Ministries with a heart for revival.',
  },
  {
    id: 'l2',
    name: 'Apostle Danjuma Musa',
    role: 'General Overseer',
    imageUrl: dad,
    bio: 'Dedicated to spreading the flame of the gospel across nations.',
  },
];