const alphabet = 'abcdefghijklmnopqrstuvwxyz';
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

export const stringifyBlocks = (blocks: Array<Array<number>>) => {
  const freq: Record<string, number> = {};
  blocks.forEach((block) => {
    block.forEach((elem) => {
      freq[elem] = (freq[elem] || 0) + 1;
    });
  });
  let stringifiedArr = blocks.toString();
  const toReplace = Object.entries(freq)
    .filter(([elem, freq]) => freq > 10)
    .filter(([elem, freq]) => String(elem).length > 1)
    .sort(([, freq1], [, freq2]) => freq2 - freq1)
    .slice(0, 26);
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
