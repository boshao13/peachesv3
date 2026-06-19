import type { Amenity } from "./types";
import { img } from "@/lib/images";

// 12 amenities (spec §6.2). Descriptions are warm, on-brand, owner-editable.
export const amenities: Amenity[] = [
  {
    slug: "weight-room",
    name: "Weight Room",
    description:
      "A full free-weight and machine floor designed for women who lift — from your first dumbbell to your heaviest PR, with room to move and zero intimidation.",
    images: [
      img("/images/gym/Gym1.webp", 2400, 1600, "Weight room at Peaches Fitness Club"),
      img("/images/gym/Gym2.webp", 2400, 1600, "Strength equipment in the weight room"),
    ],
  },
  {
    slug: "cardio-room",
    name: "Cardio Room",
    description:
      "Treadmills, bikes, stair climbers and rowers with the views and playlists to make your cardio fly by.",
    images: [
      img("/images/gym/Gym3.webp", 2400, 1600, "Cardio machines at Peaches"),
      img("/images/gym/Gym4.webp", 2400, 1600, "Cardio area"),
    ],
  },
  {
    slug: "booty-builder",
    name: "Booty Builder® Equipment",
    description:
      "Specialized glute-training machines built to sculpt, strengthen and grow — a Peaches favorite you won't find at every gym.",
    images: [
      img("/images/bootybuilder/Bootybuilder1.webp", 1600, 2400, "Booty Builder glute machine"),
      img("/images/bootybuilder/Bootybuilder2.webp", 1600, 2400, "Glute training equipment"),
      img("/images/bootybuilder/Bootybuilder3.webp", 1600, 2400, "Booty Builder station"),
    ],
  },
  {
    slug: "turf-area",
    name: "Turf Area",
    description:
      "An open functional-training zone for sled pushes, sleds, mobility and bootcamp-style work — space to train how you want.",
    images: [img("/images/gym/Gym5.webp", 1600, 2400, "Functional turf training area")],
  },
  {
    slug: "group-classes",
    name: "Group Classes",
    description:
      "Yoga, Pilates, Zumba and strength classes led by instructors who coach to every level — community energy, real results.",
    images: [
      img("/images/classes/Classes1.webp", 1600, 2400, "Group fitness class"),
      img("/images/classes/Classes2.webp", 1600, 2400, "Class in session"),
      img("/images/classes/Classes3.webp", 1789, 2400, "Group class at Peaches"),
    ],
  },
  {
    slug: "sauna",
    name: "Sauna",
    description:
      "Unwind and recover in our sauna — the warm, restorative finish your hard work deserves.",
    images: [
      img("/images/sauna/Sauna1.webp", 2400, 1600, "Sauna at Peaches Fitness Club"),
      img("/images/sauna/Sauna2.webp", 1600, 2400, "Sauna interior"),
    ],
  },
  {
    slug: "cold-plunge",
    name: "Cold Plunge",
    description:
      "Step into the cold plunge for the recovery, clarity and resilience that hot-and-cold contrast therapy is famous for.",
    images: [
      img("/images/plunge/Plunge1.webp", 1600, 2400, "Cold plunge pool"),
      img("/images/plunge/Plunge2.webp", 1600, 2400, "Cold plunge recovery"),
    ],
  },
  {
    slug: "recovery-area",
    name: "Recovery Area",
    description:
      "A dedicated space to stretch, roll out and reset — because recovery is part of the work, not an afterthought.",
    images: [img("/images/plunge/Plunge3.webp", 1600, 2400, "Recovery space")],
  },
  {
    slug: "members-lounge",
    name: "Members Lounge",
    description:
      "A comfortable lounge to relax, connect and linger — the social heart of our community.",
    images: [img("/images/lounge/PeachesLounge.webp", 2400, 1600, "Members lounge at Peaches")],
  },
  {
    slug: "peachy-bar",
    name: "Peachy Bar",
    description:
      "Refuel at the Peachy Bar with smoothies, shakes and pick-me-ups made to power your day.",
    images: [
      img("/images/peachybar/Peachybar1.webp", 1600, 2400, "The Peachy Bar"),
      img("/images/peachybar/Peachybar2.webp", 1600, 2400, "Smoothies at the Peachy Bar"),
    ],
  },
  {
    slug: "private-changing-rooms",
    name: "Private Changing Rooms",
    description:
      "Spacious, private changing rooms so you can get ready in comfort and total privacy.",
    images: [],
  },
  {
    slug: "secure-lockers",
    name: "Secure Lockers",
    description: "Keep your essentials safe in secure lockers while you focus on your workout.",
    images: [],
  },
];
