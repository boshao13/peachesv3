import type { Trainer } from "./types";
import { img } from "@/lib/images";

export const trainers: Trainer[] = [
  {
    slug: "kira",
    name: "Kira",
    title: "NASM Certified Personal Trainer & Nutrition Coach",
    photo: img(
      "/images/trainers/kira-2026.webp",
      1620,
      2160,
      "Kira, personal trainer and nutrition coach at Peaches"
    ),
    // bio[0] is the collapsed teaser on the card. Kept long enough to fill the
    // card next to Katie's, whose opening paragraph is substantial — a short
    // teaser here leaves the grid-equalised card mostly white space.
    bio: [
      "I'm a NASM certified personal trainer & nutrition coach who's passionate about helping women feel stronger, more confident, and capable through sustainable lifestyle coaching. As part of the Peaches personal training team for over 2 years, I've had the opportunity to work with women of all backgrounds, fitness levels, and goals. With a background in strength training, bodybuilding, and distance running, I take a well-rounded approach to fitness that is tailored to each woman's goals, lifestyle, and stage of life.",
      "I specialize in women's health and fitness, including pregnancy, postpartum, perimenopause, menopause, and post-menopause training. My goal is to help women build strength, improve their relationship with fitness and nutrition, and create sustainable results that support them through every stage of life.",
    ],
    specializations: [
      "Strength training",
      "Women's health & fitness",
      "Personalized training programs",
      "Pregnancy & postpartum training",
      "Perimenopause, menopause & post-menopause training",
      "Nutrition coaching",
      "Body composition & sustainable results",
      "Distance running & endurance",
    ],
    certifications: [
      "NASM Certified Personal Trainer",
      "NASM Certified Nutrition Coach",
      "Perimenopause, Menopause & Post-Menopause Training",
      "Pregnancy & Postpartum Fitness Certification",
    ],
  },
  {
    slug: "katie",
    name: "Katie Smith",
    title: "Personal Trainer · Nutrition & Group Fitness Coach",
    photo: img("/images/trainers/katie.webp", 788, 1400, "Katie Smith, personal trainer at Peaches"),
    bio: [
      "Katie Smith is a dedicated personal trainer, nutrition coach, and group fitness coach with over 25 years of experience in the fitness industry. She is passionate about helping women build confidence — both in the gym and in their own skin. Known for her discipline, strong work ethic, and supportive approach, Katie empowers her clients to grow stronger physically and mentally while embracing a balanced, sustainable lifestyle. She believes fitness should be both effective and enjoyable, and encourages her clients to work hard while still making room for fun.",
      "Outside of coaching, she prioritizes time with her large family (including 5 kids), enjoys hiking, walking and dancing, and keeps a special tradition alive with her weekly “Sourdough Sunday.” She also loves traveling back to her home state of Oregon, where she reconnects with her roots and recharges for the work she loves.",
    ],
    specializations: [
      "Personal training — 25+ years of experience",
      "Nutrition coaching for a balanced, sustainable lifestyle",
      "Group fitness instruction",
      "Helping women build confidence, in the gym and beyond",
      "Discipline, strong work ethic, and supportive coaching",
    ],
  },
];
