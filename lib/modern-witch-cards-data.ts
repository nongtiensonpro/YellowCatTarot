import { TarotCard, tarotCards } from './cards-data';

const modernWitchFilenames = [
  'MW00_TheFool.jpg',
  'MW01_TheMagician.jpg',
  'MW02_TheHighPriestess.jpg',
  'MW03_TheEmpress.jpg',
  'MW04_TheEmperor.jpg',
  'MW05_TheHierophant.jpg',
  'MW06_TheLovers.jpg',
  'MW07_TheChariot.jpg',
  'MW08_Strength.jpg',
  'MW09_TheHermit.jpg',
  'MW10_WheelOfFortune.jpg',
  'MW11_Justice.jpg',
  'MW12_TheHangedMan.jpg',
  'MW13_Death.jpg',
  'MW14_Temperance.jpg',
  'MW15_TheDevil.jpg',
  'MW16_TheTower.jpg',
  'MW17_TheStar.jpg',
  'MW18_TheMoon.jpg',
  'MW19_TheSun.jpg',
  'MW20_Judgement.jpg',
  'MW21_TheWorld.jpg',
  'MW22_AceOfWands.jpg',
  'MW23_TwoOfWands.jpg',
  'MW24_ThreeOfWands.jpg',
  'MW25_FourOfWands.jpg',
  'MW26_FiveOfWands.jpg',
  'MW27_SixOfWands.jpg',
  'MW28_SevenOfWands.jpg',
  'MW29_EightOfWands.jpg',
  'MW30_NineOfWands.jpg',
  'MW31_TenOfWands.jpg',
  'MW32_PageOfWands.jpg',
  'MW33_KnightOfWands.jpg',
  'MW34_QueenOfWands.jpg',
  'MW35_KingOfWands.jpg',
  'MW36_AceOfCups.jpg',
  'MW37_TwoOfCups.jpg',
  'MW38_ThreeOfCups.jpg',
  'MW39_FourOfCups.jpg',
  'MW40_FiveOfCups.jpg',
  'MW41_SixOfCups.jpg',
  'MW42_SevenOfCups.jpg',
  'MW43_EightOfCups.jpg',
  'MW44_NineOfCups.jpg',
  'MW45_TenOfCups.jpg',
  'MW46_PageOfCups.jpg',
  'MW47_KnightOfCups.jpg',
  'MW48_QueenOfCups.jpg',
  'MW49_KingOfCups.jpg',
  'MW50_AceOfSwords.jpg',
  'MW51_TwoOfSwords.jpg',
  'MW52_ThreeOfSwords.jpg',
  'MW53_FourOfSwords.jpg',
  'MW54_FiveOfSwords.jpg',
  'MW55_SixOfSwords.jpg',
  'MW56_SevenOfSwords.jpg',
  'MW57_EightOfSwords.jpg',
  'MW58_NineOfSwords.jpg',
  'MW59_TenOfSwords.jpg',
  'MW60_PageOfSwords.jpg',
  'MW61_KnightOfSwords.jpg',
  'MW62_QueenOfSwords.jpg',
  'MW63_KingOfSwords.jpg',
  'MW64_AceOfPentacles.jpg',
  'MW65_TwoOfPentacles.jpg',
  'MW66_ThreeOfPentacles.jpg',
  'MW67_FourOfPentacles.jpg',
  'MW68_FiveOfPentacles.jpg',
  'MW69_SixOfPentacles.jpg',
  'MW70_SevenOfPentacles.jpg',
  'MW71_EightOfPentacles.jpg',
  'MW72_NineOfPentacles.jpg',
  'MW73_TenOfPentacles.jpg',
  'MW74_PageOfPentacles.jpg',
  'MW75_KnightOfPentacles.jpg',
  'MW76_QueenOfPentacles.jpg',
  'MW77_KingOfPentacles.jpg'
];

export const modernWitchCards: TarotCard[] = tarotCards.map((card, index) => {
  return {
    ...card,
    imagePath: `/Modern_Witch_Tarot/${modernWitchFilenames[index] || ''}`
  };
});

export function getCardById(id: number): TarotCard | undefined {
  return modernWitchCards.find((card) => card.id === id);
}

export function getCardBySlug(slug: string): TarotCard | undefined {
  return modernWitchCards.find((card) => card.slug === slug);
}
