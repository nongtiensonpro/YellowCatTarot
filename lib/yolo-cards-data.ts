import { TarotCard, tarotCards } from './cards-data';

const yoloFilenames = [
  'YOLO00_TheFool.jpg',
  'YOLO01_TheMagician.jpg',
  'YOLO02_TheHighPriestess.jpg',
  'YOLO03_TheEmpress.jpg',
  'YOLO04_TheEmperor.jpg',
  'YOLO05_TheHierophant.jpg',
  'YOLO06_TheLovers.jpg',
  'YOLO07_TheChariot.jpg',
  'YOLO08_Strength.jpg',
  'YOLO09_TheHermit.jpg',
  'YOLO10_WheelOfFortune.jpg',
  'YOLO11_Justice.jpg',
  'YOLO12_TheHangedMan.jpg',
  'YOLO13_Death.jpg',
  'YOLO14_Temperance.jpg',
  'YOLO15_TheDevil.jpg',
  'YOLO16_TheTower.jpg',
  'YOLO17_TheStar.jpg',
  'YOLO18_TheMoon.jpg',
  'YOLO19_TheSun.jpg',
  'YOLO20_Judgement.jpg',
  'YOLO21_TheWorld.jpg',
  'YOLO22_AceOfWands.jpg',
  'YOLO23_TwoOfWands.jpg',
  'YOLO24_ThreeOfWands.jpg',
  'YOLO25_FourOfWands.jpg',
  'YOLO26_FiveOfWands.jpg',
  'YOLO27_SixOfWands.jpg',
  'YOLO28_SevenOfWands.jpg',
  'YOLO29_EightOfWands.jpg',
  'YOLO30_NineOfWands.jpg',
  'YOLO31_TenOfWands.jpg',
  'YOLO32_PageOfWands.jpg',
  'YOLO33_KnightOfWands.jpg',
  'YOLO34_QueenOfWands.jpg',
  'YOLO35_KingOfWands.jpg',
  'YOLO36_AceOfCups.jpg',
  'YOLO37_TwoOfCups.jpg',
  'YOLO38_ThreeOfCups.jpg',
  'YOLO39_FourOfCups.jpg',
  'YOLO40_FiveOfCups.jpg',
  'YOLO41_SixOfCups.jpg',
  'YOLO42_SevenOfCups.jpg',
  'YOLO43_EightOfCups.jpg',
  'YOLO44_NineOfCups.jpg',
  'YOLO45_TenOfCups.jpg',
  'YOLO46_PageOfCups.jpg',
  'YOLO47_KnightOfCups.jpg',
  'YOLO48_QueenOfCups.jpg',
  'YOLO49_KingOfCups.jpg',
  'YOLO50_AceOfSwords.jpg',
  'YOLO51_TwoOfSwords.jpg',
  'YOLO52_ThreeOfSwords.jpg',
  'YOLO53_FourOfSwords.jpg',
  'YOLO54_FiveOfSwords.jpg',
  'YOLO55_SixOfSwords.jpg',
  'YOLO56_SevenOfSwords.jpg',
  'YOLO57_EightOfSwords.jpg',
  'YOLO58_NineOfSwords.jpg',
  'YOLO59_TenOfSwords.jpg',
  'YOLO60_PageOfSwords.jpg',
  'YOLO61_KnightOfSwords.jpg',
  'YOLO62_QueenOfSwords.jpg',
  'YOLO63_KingOfSwords.jpg',
  'YOLO64_AceOfPentacles.jpg',
  'YOLO65_TwoOfPentacles.jpg',
  'YOLO66_ThreeOfPentacles.jpg',
  'YOLO67_FourOfPentacles.jpg',
  'YOLO68_FiveOfPentacles.jpg',
  'YOLO69_SixOfPentacles.jpg',
  'YOLO70_SevenOfPentacles.jpg',
  'YOLO71_EightOfPentacles.jpg',
  'YOLO72_NineOfPentacles.jpg',
  'YOLO73_TenOfPentacles.jpg',
  'YOLO74_PageOfPentacles.jpg',
  'YOLO75_KnightOfPentacles.jpg',
  'YOLO76_QueenOfPentacles.jpg',
  'YOLO77_KingOfPentacles.jpg'
];

export const yoloCards: TarotCard[] = tarotCards.map((card, index) => {
  return {
    ...card,
    imagePath: `/YOLO_Tarot/${yoloFilenames[index] || ''}`
  };
});

export function getCardById(id: number): TarotCard | undefined {
  return yoloCards.find((card) => card.id === id);
}

export function getCardBySlug(slug: string): TarotCard | undefined {
  return yoloCards.find((card) => card.slug === slug);
}
