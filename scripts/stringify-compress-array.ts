// although minifiers are able to replace variable names with short alphabet letters,
// this package benefits most from numbers inside the arrays being deduplicated
// this alphabet is used to deduplicate the numbers. Note that "f" is used for
// a shorthand of Array.prototype.fill and thus is not found here
const alphabet = 'abcdeghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const compressblockIndexes = (blockIndexes: number[]): string => {
  let toReturn = `${blockIndexes.toString()},`;
  let startIndex = 0;
  let streakLength = 1;
  let lastBlockIndex: number = 0;
  let streakNumber = blockIndexes[0]; // the number which is repeated in the original array
  blockIndexes.forEach((blockIndex, i) => {
    if (i === 0) return;
    if (blockIndex === lastBlockIndex && i < blockIndexes.length - 1) {
      // streak continues
      streakLength++;
    } else {
      // streak ends
      const toReplace = `,${blockIndexes.slice(startIndex, i).toString()},`;
      const replaceWith = `,...f(${streakNumber},${streakLength}),`;
      // if array fill text is shorter than what was there, replace it
      if (replaceWith.length < toReplace.length + 2) {
        toReturn = toReturn.replace(toReplace, replaceWith);
      }

      startIndex = i;
      streakNumber = blockIndex;
      streakLength = 1;
    }

    lastBlockIndex = blockIndex;
  });
  return toReturn;
};

export const stringifyBlocks = (blocks: Array<Array<number>>) => {
  const freq: Record<string, number> = {};
  blocks.forEach((block) => {
    block.forEach((elem) => {
      freq[elem] = (freq[elem] || 0) + 1;
    });
  });
  let stringifiedArr = blocks
    .map((block) => `new Uint32Array([${block.toString()}])`)
    .join(',');
  const toReplace = Object.entries(freq)
    .filter(([elem, freq]) => freq > 10)
    .filter(([elem, freq]) => String(elem).length > 1)
    .sort(([, freq1], [, freq2]) => freq2 - freq1)
    .slice(0, alphabet.length - 2);
  console.log({ toReplace });

  let pre = '';
  toReplace.forEach(([elem, freq], i) => {
    const letter = alphabet[i];
    pre += `let ${letter} = ${elem};\n`;
    const strToReplace = `,${elem},`;
    const regex = new RegExp(strToReplace, 'g');
    while (stringifiedArr.match(regex)) {
      stringifiedArr = stringifiedArr.replace(regex, `,${letter},`);
    }
  });
  return `${pre}\nconst blocks = [${stringifiedArr}];\n`;
};
