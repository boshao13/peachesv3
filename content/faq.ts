import type { FaqItem } from "./types";

// Ported verbatim, EXCEPT #5/#6 edited to match Glofox-only booking + "Contact for pricing"
// (spec §6.2). The FAQPage JSON-LD is generated from this exact text.
export const faq: FaqItem[] = [
  {
    q: "What makes Peaches unique for women?",
    a: "Peaches is tailored specifically for women, offering a safe and supportive environment. Our equipment, classes, and programs are designed with women's fitness needs and goals in mind, ensuring a comfortable and effective workout experience.",
  },
  {
    q: "Are there any classes specifically designed for women at Peaches?",
    a: "Yes, we offer a variety of classes geared towards women, including yoga, Pilates, Zumba, strength training, and more. These classes focus on areas that most interest our female clientele, such as core strength, flexibility, and overall wellness.",
  },
  {
    q: "Do you offer personal training services at Peaches?",
    a: "Absolutely! Our certified personal trainers specialize in women's fitness and can create customized workout plans to meet your individual goals, whether it's weight loss, strength building, or improving overall fitness.",
  },
  {
    q: "Is the gym equipped with amenities specific to women's needs?",
    a: "Yes, we provide amenities like secure lockers, women-specific fitness equipment, and a lounge area for relaxation and socializing. Our goal is to make your gym experience as comfortable and convenient as possible.",
  },
  {
    q: "Are there any membership packages available at Peaches?",
    a: "Yes — we offer monthly, quarterly, and annual memberships, each with access to all gym amenities and classes. Pricing varies by plan and promotion, so reach out or stop by the front desk and our team will walk you through current options and get you started.",
  },
  {
    q: "How do I sign up for classes at Peaches?",
    a: "You can book classes through our Glofox member portal (linked on our Classes page) or in person at the front desk. We recommend booking in advance to secure your spot.",
  },
];
