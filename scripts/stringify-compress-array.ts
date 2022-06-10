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

export const stringifyBlocks = (blocks: number[]) => {
  let toWrite = '';
  toWrite += ' const blocks = [\n';
  blocks.forEach((block) => {
    toWrite += `    new Uint32Array([${block}]),\n`;
  });
  toWrite += '  ];\n';

  return toWrite;

  //   const freq: Record<string, number> = {};
  //   arr.forEach((elem) => {
  //     freq[elem] = (freq[elem] || 0) + 1;
  //   });
  //   let stringifiedArr = arr.toString();

  //   const toReplace = Object.entries(freq)
  //     .filter(([elem, freq]) => freq > 8)
  //     .filter(([elem, freq]) => String(elem).length > 1)
  //     .sort(([, freq1], [, freq2]) => freq2 - freq1);

  //   let pre = '';
  //   toReplace.forEach(([elem, freq], i) => {
  //     const letter = alphabet[i];
  //     pre += `let ${letter} = ${elem};\n`;
  //     const strToReplace = `,${elem},`;
  //     const regex = new RegExp(strToReplace, 'g');
  //     while (stringifiedArr.match(regex)) {
  //       stringifiedArr = stringifiedArr.replace(regex, `,${letter},`);
  //     }
  //   });
  //   return {
  //     pre,
  //     arr: `[${stringifiedArr}]`,
  //   };
};
