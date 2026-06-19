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
    name: "Katie",
    title: "Personal Trainer",
    photo: img("/images/trainers/katie.webp", 788, 1400, "Katie, personal trainer at Peaches"),
    // TODO: replace with Katie's real bio once provided by the owner.
    bio: [
      "Meet Katie, one of our personal trainers at Peaches. Her full bio is on the way — check back soon to learn about her approach and what she loves about coaching here.",
    ],
    specializations: [],
  },
];
