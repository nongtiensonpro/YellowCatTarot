import { TarotCard, tarotCards } from './cards-data';

const lightSeersFilenames = [
  'T00_TheFool.jpg',
  'T01_TheMagician.jpg',
  'T02_TheHighPriestess.jpg',
  'T03_TheEmpress.jpg',
  'T04_TheEmperor.jpg',
  'T05_TheHierophant.jpg',
  'T06_TheLovers.jpg',
  'T07_TheChariot.jpg',
  'T08_Strength.jpg',
  'T09_TheHermit.jpg',
  'T10_WheelOfFortune.jpg',
  'T11_Justice.jpg',
  'T12_TheHangedMan.jpg',
  'T13_Death.jpg',
  'T14_Temperance.jpg',
  'T15_TheDevil.jpg',
  'T16_TheTower.jpg',
  'T17_TheStar.jpg',
  'T18_TheMoon.jpg',
  'T19_TheSun.jpg',
  'T20_Judgement.jpg',
  'T21_TheWorld.jpg',
  'T22_AceOfWands.jpg',
  'T23_TwoOfWands.jpg',
  'T24_ThreeOfWands.jpg',
  'T25_FourOfWands.jpg',
  'T26_FiveOfWands.jpg',
  'T27_SixOfWands.jpg',
  'T28_SevenOfWands.jpg',
  'T29_EightOfWands.jpg',
  'T30_NineOfWands.jpg',
  'T31_TenOfWands.jpg',
  'T32_PageOfWands.jpg',
  'T33_KnightOfWands.jpg',
  'T34_QueenOfWands.jpg',
  'T35_KingOfWands.jpg',
  'T36_AceOfCups.jpg',
  'T37_TwoOfCups.jpg',
  'T38_ThreeOfCups.jpg',
  'T39_FourOfCups.jpg',
  'T40_FiveOfCups.jpg',
  'T41_SixOfCups.jpg',
  'T42_SevenOfCups.jpg',
  'T43_EightOfCups.jpg',
  'T44_NineOfCups.jpg',
  'T45_TenOfCups.jpg',
  'T46_PageOfCups.jpg',
  'T47_KnightOfCups.jpg',
  'T48_QueenOfCups.jpg',
  'T49_KingOfCups.jpg',
  'T50_AceOfSwords.jpg',
  'T51_TwoOfSwords.jpg',
  'T52_ThreeOfSwords.jpg',
  'T53_FourOfSwords.jpg',
  'T54_FiveOfSwords.jpg',
  'T55_SixOfSwords.jpg',
  'T56_SevenOfSwords.jpg',
  'T57_EightOfSwords.jpg',
  'T58_NineOfSwords.jpg',
  'T59_TenOfSwords.jpg',
  'T60_PageOfSwords.jpg',
  'T61_KnightOfSwords.jpg',
  'T62_QueenOfSwords.jpg',
  'T63_KingOfSwords.jpg',
  'T64_AceOfPentacles.jpg',
  'T65_TwoOfPentacles.jpg',
  'T66_ThreeOfPentacles.jpg',
  'T67_FourOfPentacles.jpg',
  'T68_FiveOfPentacles.jpg',
  'T69_SixOfPentacles.jpg',
  'T70_SevenOfPentacles.jpg',
  'T71_EightOfPentacles.jpg',
  'T72_NineOfPentacles.jpg',
  'T73_TenOfPentacles.jpg',
  'T74_PageOfPentacles.jpg',
  'T75_KnightOfPentacles.jpg',
  'T76_QueenOfPentacles.jpg',
  'T77_KingOfPentacles.jpg'
];

export const lightSeersCards: TarotCard[] = tarotCards.map((card, index) => {
  return {
    ...card,
    imagePath: `/Light_Seers_Tarot/${lightSeersFilenames[index] || ''}`
  };
});

export function getCardById(id: number): TarotCard | undefined {
  return lightSeersCards.find((card) => card.id === id);
}

export function getCardBySlug(slug: string): TarotCard | undefined {
  return lightSeersCards.find((card) => card.slug === slug);
}
