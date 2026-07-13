import type { KidsCare } from "./types";
import { img } from "@/lib/images";

export const kidsCare: KidsCare = {
  intro:
    "Embrace your fitness journey with confidence while we take care of your little ones. For only $20 a month, and $10 for each additional child, delight in the freedom to work out, knowing your kids are enjoying their time just a hop, skip, and a jump away. Step into our women-focused gym where we empower you to prioritize yourself, as we nurture your children with fun and engaging activities.",
  priceMonthly: "$20/month",
  priceAdditional: "$10",
  images: [
    img("/images/kids/kidsclub1.webp", 2400, 2400, "Kids Care play area"),
    img("/images/kids/kidsclub2.webp", 2400, 2400, "Children at Kids Care"),
    img("/images/kids/kidsclub3.webp", 2400, 2400, "Kids Care activities"),
    img("/images/kids/kidsclub4.webp", 2400, 2400, "Kids Care room"),
    img("/images/kids/kidsclub5.webp", 2400, 2400, "Kids enjoying Kids Care"),
  ],
};
