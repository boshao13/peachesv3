import type { Trainer } from "./types";
import { img } from "@/lib/images";

export const trainers: Trainer[] = [
  {
    slug: "kira",
    name: "Kira",
    title: "NASM Certified Personal Trainer",
    photo: img("/images/trainers/kira.webp", 900, 1600, "Kira, personal trainer at Peaches"),
    bio: [
      "Hi, I'm Kira! I'm a NASM certified personal trainer who loves helping women build their confidence inside and outside of the gym. Specializing in strength training and empowering women to break past their limits, I'm passionate about helping clients reach their fitness goals and build lasting, healthy habits for their future selves.",
      "With a focus on individualized coaching, I'm committed to providing a supportive, results-driven experience that's tailored to each woman's journey.",
    ],
    specializations: [
      "Strength training with a focus on empowerment and pushing past personal limits",
      "Helping women break barriers and unlock their full potential",
      "Encouraging long-term, sustainable health and fitness habits",
      "Personalized training programs that prioritize individual goals and progress",
      "Building confidence inside and outside the gym",
    ],
    certifications: ["NASM Certified Personal Trainer"],
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
