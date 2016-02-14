import data from './data.fr';
import Grid from './grid';
import cellTemplate from './cell.jade';
import Random from 'random-js';

const size = Object.freeze({ w: 4, h: 4 });

const r = Random();
const values = r.string(size.w * size.h, data.distribution);

const QUALIFIERS_TABLE = [
  ['ld', 'lt'],
  ['ld', 'ld', 'lt', 'wd'],
  ['ld', 'lt', 'lt', 'wd', 'wd', 'wt']
];

const currentTour = 2;
const qualifiers = QUALIFIERS_TABLE[currentTour];
const qualifierPopulation = Array.from({ length: values.length }, (_, i) => i);
const qualifiersIndices = r.sample(qualifierPopulation, qualifiers.length);

function cellRenderer(letter, row, column) {
  const letterIndex = row * size.w + column;
  const qualifierIndex = qualifiersIndices.indexOf(letterIndex);
  let qualifierClass = '';
  if (qualifierIndex >= 0) {
    qualifierClass = qualifiers[qualifierIndex];
  }
  return cellTemplate({ letter, score: data.scores[letter], qualifierClass });
}

const grid = new Grid(size, values, cellRenderer);
const gridElt = document.querySelector('.grid');
grid.render(gridElt);

