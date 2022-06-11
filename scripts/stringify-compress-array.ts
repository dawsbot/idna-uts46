const alphabet = 'abcdeghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const stringifyCompressArray = (arr: any[]) => {
  const freq: Record<string, number> = {};
  arr.forEach((elem) => {
    freq[elem] = (freq[elem] || 0) + 1;
  });
  let stringifiedArr = arr.toString();

  const toReplace = Object.entries(freq)
    .filter(([elem, freq]) => freq > 8)
    .filter(([elem, freq]) => String(elem).length > 1)
    .sort(([, freq1], [, freq2]) => freq2 - freq1);

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
  return {
    pre,
    arr: `[${stringifiedArr}]`,
  };
};

export const compressblockIndexes = (blockIndexes: number[]): string => {
  const toReturn = blockIndexes.toString();
  // let replaceMap: Array<{ startIndex: number; endIndex: number; num: string }> =
  //   [];
  let startIndex = 0;
  let streakLength = 1;
  let lastBlockIndex: number = 0;
  let streakNumber = blockIndexes[0]; // the number which is repeated in the original array
  blockIndexes.forEach((blockIndex, i) => {
    if (i === 0) return;
    if (blockIndex === lastBlockIndex) {
      // streak continues
      streakLength++;
    } else {
      // streak ends
      if (streakLength > 5) {
        console.log(
          `Streak ended. There were "${streakLength}" of "${blockIndex}"`,
        );
      }

      startIndex = i;
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
