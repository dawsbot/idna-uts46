const axios = require('axios');
const fs = require('fs');

const NUM_UCHAR = 0x10ffff + 1;
async function downloadUnicode(version) {
  console.log('Resource Files from www.unicode.org ...');
  uribase = 'http://www.unicode.org/Public/';
  idna_tables = uribase + 'idna/' + version;
  console.log('... ' + idna_tables + '/IdnaTestV2.txt');
  console.log('... ' + idna_tables + '/IdnaMappingTable.txt');
  console.log(
    '... ' + uribase + version + '/ucd/extracted/DerivedGeneralCategory.txt\n',
  );

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

function uniChar(i) {
  try {
    //     const char = String.fromCharCode(i);
    const char = String.fromCodePoint(i);
    //     console.log({ i, char });
    return char;
  } catch (err) {
    console.warn({ i, err });
  }
}

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
      // remove all comments
      .map((line) => line.replace(/#.*/, ''))
      // remove blank lines
      .filter((line) => line !== '')
      .map((line) => {
        const parts = line.split(';').map((p) => p.trim());

        // convert hex to number
        let [start, end] = parts[0].split('..').map((num) => parseInt(num, 16));
        if (!end) {
          end = start;
        }
        return {
          start,
          end,
          parts: parts.slice(1),
        };
      })
  );
}

class MappedValue {
  constructor(parts) {
    this.flags = 0;
    this.rule = parts[0].split(' ')[0];

    // If there are two parts, the second part is the mapping in question.
    if (parts.length > 1 && parts[1]) {
      this.chars = parts[1]
        .split(' ')
        .map((char) => {
          const parsed = parseInt(char, 16);
          return uniChar(parsed);
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
  let vals = [];
  console.log('... parse unicode data file (IdnaMappingTable.txt)');
  let toWrite = '';
  parseUnicodeDataFile(idnaMapTable).forEach(({ start, end, parts }) => {
    for (let ch = start; ch <= end; ch++) {
      const value = new MappedValue(parts);
      vals.push(value);
      unicharMap[ch] = value;
    }
  });

  // Note which characters have the combining mark property.
  console.log('... parse unicode data file (DerivedGeneralCategory.txt)');
  parseUnicodeDataFile(derivedGeneralCategory).forEach(
    ({ start, end, parts }) => {
      if (
        ['Mc', 'Mn', 'Me'].some((substring) => parts[0].includes(substring))
      ) {
        for (let ch = start; ch <= end; ch++) {
          unicharMap[ch].flags |= 2;
        }
      }
    },
  );

  console.log('... build up internal unicharMap');
  // Build up the string to use to map the output
  function sortByLength(a, b) {
    return a.chars.length - b.chars.length;
  }
  console.log(vals[200].chars);
  console.log(vals[200].flags);
  console.log(vals[200].rule);
  vals = vals.sort(sortByLength).reverse();
  console.log(vals[0].chars);
  console.log(vals[0].flags);
  console.log(vals[0].rule);
}
