import './localization';
import options from './options';
import { setupJiryeokBrand } from './jiryeokBrand';
import { Roulette } from './roulette';

const roulette = new Roulette();

(window as any).roulette = roulette;
(window as any).options = options;

setupJiryeokBrand();
