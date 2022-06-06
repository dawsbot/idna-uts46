const axios = require('axios');
const fs = require('fs');

const NUM_UCHAR = 0x10ffff + 1;
async function downloadUnicode(version) {
  console.log('Resource Files from www.unicode.org ...');
  uribase = 'http://www.unicode.org/Public/';
  idna_tables = uribase + 'idna/' + version;
  console.log('... ' + idna_tables + '/IdnaTestV2.txt');

  const [infd, dgc] = await Promise.all([
    axios(idna_tables + '/IdnaMappingTable.txt').then((res) => res.data),
    axios(uribase + version + '/ucd/extracted/DerivedGeneralCategory.txt').then(
      (res) => res.data,
    ),
    //     axios(idna_tables + '/IdnaTestV2.txt')
    //       .then((res) => res.data)
    //       .then((data) => fs.writeFileSync('test/IdnaTest.txt', data)),
  ]);
  await buildUnicodeMap(infd, dgc);
}

async function main() {
  const version = process.argv[2];
  if (!version) {
    throw new Error(
      'Expected unicode version but found none. Provide a version from https://www.unicode.org/Public/idna/',
    );
  }
  await downloadUnicode(version);
}

main();

function parseUnicodeDataFile(fd) {
  /* Parse each line to [start, end, fields] for the given Unicode data
file. These files are of the same basic format: a semicolon-delimited set
of columns, where the first column is either a single element or a range of
characters. In this case, the range implied by start and end are
inclusive.
*/
  return (
    fd
      .split('\n')
      // remove comment lines
      .filter((line) => !line.startsWith('#'))
      // remove blank lines
      .filter((line) => line !== '')
      .map((line) => {
        const parts = line.split(';').map((p) => p.trim());

        // convert hex to number
        let [start, end] = parts[0].split('..').map((num) => parseInt(num, 16));
        if (!end) {
          end = start;
        }
        return { start, end, parts: parts.slice(1) };
      })
  );
}

class MappedValue {
  constructor(parts) {
    this.flags = 0;
    this.rule = parts[0];

    // If there are two parts, the second part is the mapping in question.
    if (parts.length > 1 && parts[1]) {
      this.chars = parts[1]
        .split(' ')[0]
        .split('')
        .map((char) => {
          console.log({ char });
          return parseInt(char, 16);
        })
        .join('');
    } else {
      this.chars = '';
    }

    /* In the case of disallowed_STD3_*, we process the real rule as the
     text following the last _, and set a flag noting to note the
     difference. */
    if (this.rule.startsWith('disallowed_STD3')) {
      this.flags |= 1;
      this.rule = this.rule.split('_').pop();
    }
  }
}
function buildUnicodeMap(idnaMapTable, derivedGeneralCategory) {
  console.log('Build Unicode Map');
  unicharMap = Array(NUM_UCHAR).fill(0);
  vals = [];
  console.log('... parse unicode data file (IdnaMappingTable.txt)');
  let toWrite = '';
  parseUnicodeDataFile(idnaMapTable).forEach(({ start, end, parts }) => {
    const value = new MappedValue(parts);
    // console.log({ start, end, parts });
    for (let ch = start; ch <= end; ch++) {
      vals.push(value);
      unicharMap[ch] = value;
    }
  });

  // Note which characters have the combining mark property.
  console.log('... parse unicode data file (DerivedGeneralCategory.txt)');
  parseUnicodeDataFile(derivedGeneralCategory).forEach(
    ({ start, end, parts }) => {
      if (['Mc', 'Mn', 'Me'].includes(parts[0])) {
        for (let ch = start; ch <= end; ch++) {
          // bitwise OR
          unicharMap[ch].flags = unicharMap[ch].flags | 2;
        }
      }
    },
  );
  console.log({ unicharMap });
}
