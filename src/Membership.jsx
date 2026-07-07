import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import Seo from './Seo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faInfinity,
  faHeart,
  faLeaf,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

import heroPhoto from './images/opt/mainphoto.webp';
import peachAsset from './images/opt/peachasset.webp';
import classesImg from './images/opt/classes1.webp';
import saunaImg from './images/opt/sauna.webp';
import coldPlungeImg from './images/opt/coldplunge3.webp';
import bootyImg from './images/opt/bootybuilder3.webp';
import barImg from './images/opt/peachybar.webp';
import loungeImg from './images/opt/lounge3.webp';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const GLOFOX_URL =
  'https://app.glofox.com/portal/#/branch/65d38d833aabb0e6490203b0/memberships';

const handleJoin = () => {
  window.location.href = GLOFOX_URL;
};

const PERKS = [
  'Full access to all gym amenities',
  'Unlimited group classes',
  'Sauna & cold plunge access',
  'Members lounge & Peachy Bar',
  'Exclusive Booty Builder® equipment',
  'Month-to-month — no contracts',
];

const AMENITIES = [
  { area: 'classes', img: classesImg, label: 'Group Classes', note: 'Unlimited, every day' },
  { area: 'sauna', img: saunaImg, label: 'Sauna', note: 'Unwind & recover' },
  { area: 'cold', img: coldPlungeImg, label: 'Cold Plunge', note: 'Reset & recharge' },
  { area: 'bar', img: barImg, label: 'Peachy Bar', note: 'Sip & socialize', pos: 'center top' },
  { area: 'booty', img: bootyImg, label: 'Booty Builder® Equipment', note: 'Our signature machines' },
  { area: 'lounge', img: loungeImg, label: 'Members Lounge', note: 'Relax between sets' },
];

const REASONS = [
  {
    icon: faInfinity,
    title: 'No Contracts',
    body: 'Month-to-month freedom. Pause or cancel whenever life happens — no penalties, no fine print.',
  },
  {
    icon: faLeaf,
    title: 'Everything Included',
    body: 'One membership unlocks every amenity, every class, every day. Nothing hidden behind a higher tier.',
  },
  {
    icon: faHeart,
    title: 'A Real Community',
    body: 'Train, recover, and unwind at the Peachy Bar with a crew that actually cheers you on.',
  },
];

/* ------------------------------------------------------------------ */
/*  Motion                                                             */
/* ------------------------------------------------------------------ */

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
  50%      { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
`;

const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* ------------------------------------------------------------------ */
/*  Layout shell                                                       */
/* ------------------------------------------------------------------ */

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
`;

const Page = styled.div`
  --cream: #fcf3ec;
  --cream-2: #fbe9dc;
  --peach: #fb927c;
  --peach-2: #fab39d;
  --peach-3: #fddac5;
  --terracotta: #d56f52;
  --terracotta-2: #c2563c;
  --ink: #3e2a20;
  --ink-2: #8a6a5a;

  position: relative;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Lato', sans-serif;
  overflow: hidden;

  /* faint film grain for depth */
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.04;
    background-image: url("${NOISE}");
  }

  & > section {
    position: relative;
    z-index: 1;
  }

  /* scroll reveal */
  [data-reveal] {
    opacity: 0;
    transform: translateY(34px);
    transition: opacity 0.85s ease, transform 0.85s cubic-bezier(0.2, 0.7, 0.2, 1);
    will-change: opacity, transform;
  }
  [data-reveal].is-visible {
    opacity: 1;
    transform: none;
  }
`;

/* ------------------------------------------------------------------ */
/*  Shared bits                                                        */
/* ------------------------------------------------------------------ */

const Script = styled.span`
  font-family: 'Pacifico', cursive;
  background: linear-gradient(115deg, var(--peach), var(--terracotta));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 400;
  letter-spacing: 0;
`;

const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 12.5px;
  color: var(--terracotta);

  &::before {
    content: '';
    width: 26px;
    height: 2px;
    background: var(--peach);
    border-radius: 2px;
  }
`;

const JoinButton = styled.button`
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  border: none;
  cursor: pointer;
  background: linear-gradient(120deg, var(--peach) 0%, var(--terracotta) 100%);
  padding: 17px 36px;
  border-radius: 40px;
  box-shadow: 0 16px 30px -12px rgba(213, 111, 82, 0.75);
  display: inline-flex;
  align-items: center;
  gap: 11px;
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;

  svg {
    font-size: 13px;
    transition: transform 0.25s ease;
  }
  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 24px 40px -12px rgba(213, 111, 82, 0.85);
    filter: brightness(1.05);
  }
  &:hover svg {
    transform: translateX(5px);
  }
  &:active {
    transform: translateY(-1px) scale(1);
  }
`;

const GhostButton = styled.button`
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  font-weight: 600;
  font-size: 14px;
  background: transparent;
  color: var(--terracotta);
  border: 2px solid rgba(213, 111, 82, 0.35);
  padding: 15px 28px;
  border-radius: 40px;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;

  &:hover {
    background: rgba(213, 111, 82, 0.08);
    border-color: var(--terracotta);
    transform: translateY(-2px);
  }
`;

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

const Hero = styled.section`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 56px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 150px 6vw 90px;

  /* warm atmosphere */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(circle at 82% 12%, rgba(251, 146, 124, 0.28), transparent 42%),
      radial-gradient(circle at 8% 88%, rgba(213, 111, 82, 0.18), transparent 40%);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 130px 7vw 70px;
    text-align: center;
  }
`;

const HeroCopy = styled.div`
  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const H1 = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: clamp(42px, 7vw, 80px);
  line-height: 0.97;
  letter-spacing: -1px;
  margin: 22px 0 0;
  color: var(--ink);

  ${Script} {
    text-transform: none;
    display: inline-block;
    font-size: clamp(38px, 6.4vw, 70px);
    line-height: 1.15;
    margin-top: 6px;
  }
`;

const HeroText = styled.p`
  font-size: clamp(16px, 1.5vw, 18.5px);
  line-height: 1.65;
  color: var(--ink-2);
  max-width: 480px;
  margin: 24px 0 32px;

  @media (max-width: 900px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const TrustRow = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  padding: 0;
  margin: 34px 0 0;

  li {
    font-family: 'Oswald', sans-serif;
    font-weight: 400;
    letter-spacing: 0.4px;
    font-size: 14px;
    color: var(--ink);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    opacity: 0.85;
  }
  svg {
    color: var(--terracotta);
    font-size: 12px;
  }

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const HeroVisual = styled.div`
  position: relative;
  justify-self: center;
`;

const PhotoFrame = styled.div`
  width: min(440px, 80vw);
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  overflow: hidden;
  border: 7px solid #fff;
  background-image: url(${heroPhoto});
  background-size: cover;
  background-position: center;
  box-shadow: 0 40px 70px -28px rgba(120, 60, 40, 0.55);

  @media (max-width: 900px) {
    aspect-ratio: 5 / 4;
    width: min(460px, 88vw);
  }
`;

const Sticker = styled.div`
  --rot: -10deg;
  position: absolute;
  top: -26px;
  left: -26px;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: var(--terracotta);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 13px;
  line-height: 1.2;
  border: 3px dashed rgba(255, 255, 255, 0.65);
  box-shadow: 0 14px 26px -10px rgba(120, 60, 40, 0.6);
  animation: ${float} 6s ease-in-out infinite;

  @media (max-width: 480px) {
    width: 86px;
    height: 86px;
    font-size: 11px;
    top: -16px;
    left: -10px;
  }
`;

const PhotoChip = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-radius: 40px;
  padding: 11px 20px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  letter-spacing: 0.6px;
  font-size: 14px;
  color: var(--ink);
  box-shadow: 0 14px 28px -12px rgba(120, 60, 40, 0.5);

  svg {
    color: #fff;
    background: linear-gradient(120deg, var(--peach), var(--terracotta));
    padding: 5px;
    border-radius: 50%;
    font-size: 10px;
    width: 10px;
    height: 10px;
  }
`;

/* ------------------------------------------------------------------ */
/*  Plan                                                               */
/* ------------------------------------------------------------------ */

const PlanSection = styled.section`
  padding: 30px 6vw 96px;
  text-align: center;
`;

const SectionHead = styled.div`
  max-width: 640px;
  margin: 0 auto 50px;

  h2 {
    font-family: 'Oswald', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: clamp(30px, 4.4vw, 46px);
    line-height: 1.05;
    letter-spacing: -0.5px;
    margin: 16px 0 0;
    color: var(--ink);
  }
  ${Script} {
    text-transform: none;
  }
  p {
    font-size: 17px;
    line-height: 1.6;
    color: var(--ink-2);
    margin: 16px auto 0;
    max-width: 520px;
  }
`;

const PlanCard = styled.div`
  position: relative;
  width: min(460px, 90vw);
  margin: 0 auto;
  background: #fff;
  border-radius: 28px;
  padding: 46px 40px 40px;
  text-align: left;
  box-shadow: 0 40px 80px -30px rgba(120, 60, 40, 0.45);
  overflow: hidden;
  transition: transform 0.4s ease, box-shadow 0.4s ease;

  /* peach top accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 7px;
    background: linear-gradient(120deg, var(--peach), var(--terracotta));
  }
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 50px 90px -28px rgba(120, 60, 40, 0.55);
  }
`;

const Ribbon = styled.span`
  position: absolute;
  top: 26px;
  right: -52px;
  transform: rotate(45deg);
  background: var(--terracotta);
  color: #fff;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 11.5px;
  font-weight: 600;
  padding: 7px 60px;
  box-shadow: 0 8px 18px -8px rgba(120, 60, 40, 0.6);
`;

const PlanName = styled.h3`
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 15px;
  color: var(--terracotta);
  margin: 6px 0 14px;
`;

const Price = styled.div`
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  font-size: clamp(34px, 6vw, 44px);
  line-height: 1;
  color: var(--ink);
  letter-spacing: -0.5px;

  small {
    display: block;
    font-weight: 400;
    font-size: 14px;
    letter-spacing: 0.5px;
    color: var(--ink-2);
    text-transform: uppercase;
    margin-top: 12px;
  }
`;

const Divider = styled.div`
  height: 0;
  border-top: 2px dashed var(--peach-3);
  margin: 26px 0;
`;

const PerkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  display: grid;
  gap: 15px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    font-size: 16px;
    line-height: 1.4;
    color: var(--ink);
  }
  .tick {
    flex: none;
    margin-top: 1px;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    background: linear-gradient(120deg, var(--peach), var(--terracotta));
    font-size: 10px;
    box-shadow: 0 6px 12px -5px rgba(213, 111, 82, 0.7);
  }
`;

const PlanCta = styled(JoinButton)`
  width: 100%;
  justify-content: center;
`;

const Reassurance = styled.p`
  text-align: center;
  font-family: 'Oswald', sans-serif;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-size: 13.5px;
  color: var(--ink-2);
  margin: 16px 0 0;
`;

/* ------------------------------------------------------------------ */
/*  Amenities (bento)                                                  */
/* ------------------------------------------------------------------ */

const AmenitiesSection = styled.section`
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%);
  padding: 90px 0 100px;
  text-align: center;
`;

const Bento = styled.div`
  display: grid;
  gap: 16px;
  width: 88%;
  max-width: 1120px;
  margin: 0 auto;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 200px;
  grid-template-areas:
    'classes classes sauna cold'
    'classes classes sauna bar'
    'booty booty lounge lounge';

  @media (max-width: 900px) {
    width: 90%;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 184px;
    grid-template-areas:
      'classes classes'
      'sauna sauna'
      'cold bar'
      'booty booty'
      'lounge lounge';
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    grid-auto-rows: 210px;
    grid-template-areas:
      'classes'
      'sauna'
      'cold'
      'bar'
      'booty'
      'lounge';
  }
`;

const Amenity = styled.article`
  grid-area: ${(p) => p.$area};
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 16px 34px -16px rgba(120, 60, 40, 0.5);
  transition: transform 0.4s ease, box-shadow 0.4s ease;

  .img {
    position: absolute;
    inset: 0;
    background-image: url(${(p) => p.$img});
    background-size: cover;
    background-position: ${(p) => p.$pos || 'center'};
    transition: transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(40, 20, 12, 0) 38%, rgba(40, 20, 12, 0.74) 100%);
  }
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 26px 48px -18px rgba(120, 60, 40, 0.62);
  }
  &:hover .img {
    transform: scale(1.08);
  }
`;

const AmenityLabel = styled.div`
  position: absolute;
  z-index: 2;
  left: 20px;
  bottom: 18px;
  text-align: left;
  color: #fff;

  strong {
    display: block;
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-size: 18px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  }
  span {
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    opacity: 0.9;
  }
`;

/* ------------------------------------------------------------------ */
/*  Why                                                                */
/* ------------------------------------------------------------------ */

const WhySection = styled.section`
  padding: 96px 6vw;
  text-align: center;
`;

const ReasonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  max-width: 1040px;
  margin: 52px auto 0;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 22px;
    max-width: 460px;
  }
`;

const Reason = styled.div`
  background: #fff;
  border-radius: 22px;
  padding: 40px 30px 34px;
  border: 1px solid rgba(213, 111, 82, 0.12);
  box-shadow: 0 22px 44px -28px rgba(120, 60, 40, 0.5);
  text-align: left;
  transition: transform 0.35s ease, box-shadow 0.35s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 54px -26px rgba(120, 60, 40, 0.55);
  }

  .badge {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 22px;
    background: linear-gradient(135deg, var(--peach), var(--terracotta));
    box-shadow: 0 14px 24px -12px rgba(213, 111, 82, 0.8);
    margin-bottom: 22px;
  }
  h4 {
    font-family: 'Oswald', sans-serif;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.6px;
    font-size: 21px;
    margin: 0 0 10px;
    color: var(--ink);
  }
  p {
    font-size: 15.5px;
    line-height: 1.6;
    color: var(--ink-2);
    margin: 0;
  }
`;

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

const CtaBand = styled.section`
  position: relative;
  margin: 0 5vw 80px;
  border-radius: 34px;
  overflow: hidden;
  background-image: url(${peachAsset});
  background-size: cover;
  background-position: center;
  text-align: center;
  padding: 84px 8vw;
  color: #fff;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(213, 111, 82, 0.2), rgba(194, 86, 60, 0.55));
  }
  & > * {
    position: relative;
    z-index: 1;
  }
`;

const CtaTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: clamp(32px, 5.2vw, 56px);
  line-height: 1.02;
  letter-spacing: -0.5px;
  margin: 14px 0 0;

  ${Script} {
    text-transform: none;
    background: none;
    -webkit-text-fill-color: #fff;
    color: #fff;
  }
`;

const CtaText = styled.p`
  font-size: 17px;
  line-height: 1.6;
  max-width: 460px;
  margin: 18px auto 32px;
  color: rgba(255, 255, 255, 0.92);
`;

const WhiteButton = styled(JoinButton)`
  background: #fff;
  color: var(--terracotta);
  box-shadow: 0 18px 34px -14px rgba(60, 25, 12, 0.55);

  svg {
    color: var(--terracotta);
  }
  &:hover {
    box-shadow: 0 26px 44px -14px rgba(60, 25, 12, 0.6);
    filter: brightness(1);
  }
`;

const CtaWhiteEyebrow = styled(Eyebrow)`
  color: #fff;
  justify-content: center;
  &::before {
    background: rgba(255, 255, 255, 0.85);
  }
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const scrollToAmenities = () => {
  const el = document.getElementById('amenities');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const Membership = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const nodes = pageRef.current
      ? Array.from(pageRef.current.querySelectorAll('[data-reveal]'))
      : [];

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return (
    <RootContainer>
      <Seo
        path="/membership"
        title="Membership | Peaches Fitness Club — Women's Gym Albuquerque"
        description="One month-to-month membership unlocks the whole club: unlimited classes, sauna, cold plunge, Peachy Bar, members lounge & Booty Builder equipment. No contracts."
      />
      <Header />
      <Page ref={pageRef}>
        {/* ----------------------------- HERO ----------------------------- */}
        <Hero>
          <HeroCopy>
            <Eyebrow data-reveal>Peaches Fitness Club · Membership</Eyebrow>
            <H1 data-reveal style={{ transitionDelay: '0.08s' }}>
              All of Peaches.
              <br />
              <Script>One simple pass.</Script>
            </H1>
            <HeroText data-reveal style={{ transitionDelay: '0.16s' }}>
              Full gym access, unlimited classes, sauna, cold plunge, the Peachy
              Bar and members lounge — everything unlocked on one month-to-month
              membership. No contracts. No lock-in. Just show up and bloom.
            </HeroText>
            <HeroActions data-reveal style={{ transitionDelay: '0.24s' }}>
              <JoinButton onClick={handleJoin}>
                Join Now <FontAwesomeIcon icon={faArrowRight} />
              </JoinButton>
              <GhostButton onClick={scrollToAmenities}>
                Explore the perks
              </GhostButton>
            </HeroActions>
            <TrustRow data-reveal style={{ transitionDelay: '0.32s' }}>
              <li>
                <FontAwesomeIcon icon={faCheck} /> No contracts
              </li>
              <li>
                <FontAwesomeIcon icon={faCheck} /> Cancel anytime
              </li>
              <li>
                <FontAwesomeIcon icon={faCheck} /> Everything included
              </li>
            </TrustRow>
          </HeroCopy>

          <HeroVisual data-reveal style={{ transitionDelay: '0.2s' }}>
            <PhotoFrame />
            <Sticker>
              No
              <br />
              Contracts
            </Sticker>
            <PhotoChip>
              <FontAwesomeIcon icon={faCheck} /> Everything included
            </PhotoChip>
          </HeroVisual>
        </Hero>

        {/* ----------------------------- PLAN ----------------------------- */}
        <PlanSection>
          <SectionHead data-reveal>
            <Eyebrow style={{ justifyContent: 'center' }}>Simple pricing</Eyebrow>
            <h2>
              One plan. <Script>Zero catch.</Script>
            </h2>
            <p>
              We kept it refreshingly simple — a single membership that unlocks
              the entire club, billed month to month.
            </p>
          </SectionHead>

          <PlanCard data-reveal>
            <Ribbon>Month-to-Month</Ribbon>
            <PlanName>Monthly Membership</PlanName>
            <Price>
              Contact for pricing
              <small>Flexible monthly rate · cancel anytime</small>
            </Price>
            <Divider />
            <PerkList>
              {PERKS.map((perk) => (
                <li key={perk}>
                  <span className="tick">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  {perk}
                </li>
              ))}
            </PerkList>
            <PlanCta onClick={handleJoin}>
              Join Now <FontAwesomeIcon icon={faArrowRight} />
            </PlanCta>
            <Reassurance>No long-term commitment — leave whenever you like.</Reassurance>
          </PlanCard>
        </PlanSection>

        {/* --------------------------- AMENITIES -------------------------- */}
        <AmenitiesSection id="amenities">
          <SectionHead data-reveal>
            <Eyebrow style={{ justifyContent: 'center' }}>What's included</Eyebrow>
            <h2>
              Everything's <Script>included.</Script>
            </h2>
            <p>
              One membership, the whole club. No upsells, no premium tiers — just
              the full Peaches experience, every single day.
            </p>
          </SectionHead>

          <Bento data-reveal>
            {AMENITIES.map((a) => (
              <Amenity key={a.area} $area={a.area} $img={a.img} $pos={a.pos}>
                <div className="img" />
                <AmenityLabel>
                  <strong>{a.label}</strong>
                  <span>{a.note}</span>
                </AmenityLabel>
              </Amenity>
            ))}
          </Bento>
        </AmenitiesSection>

        {/* ----------------------------- WHY ------------------------------ */}
        <WhySection>
          <SectionHead data-reveal>
            <Eyebrow style={{ justifyContent: 'center' }}>Why members love it</Eyebrow>
            <h2>
              Built for <Script>real life.</Script>
            </h2>
          </SectionHead>

          <ReasonGrid>
            {REASONS.map((r, i) => (
              <Reason key={r.title} data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="badge">
                  <FontAwesomeIcon icon={r.icon} />
                </div>
                <h4>{r.title}</h4>
                <p>{r.body}</p>
              </Reason>
            ))}
          </ReasonGrid>
        </WhySection>

        {/* --------------------------- FINAL CTA -------------------------- */}
        <CtaBand data-reveal>
          <CtaWhiteEyebrow>Your spot is waiting</CtaWhiteEyebrow>
          <CtaTitle>
            Ready to <Script>bloom?</Script>
          </CtaTitle>
          <CtaText>
            Join Peaches today and unlock the entire club with one simple
            membership. We'll see you on the floor.
          </CtaText>
          <WhiteButton onClick={handleJoin}>
            Join Now <FontAwesomeIcon icon={faArrowRight} />
          </WhiteButton>
        </CtaBand>
      </Page>
      <Footer />
    </RootContainer>
  );
};

export default Membership;
