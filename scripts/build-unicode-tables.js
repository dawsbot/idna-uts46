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
        //     line = line.replace(/^#/, '').trim();
        //     if (!line) return;
        const parts = line.split(';').map((p) => p.trim());

        let [start, end] = parts[0].split('..').map((num) => parseInt(num, 16));
        //   stend = [int(x, 16) for x in parts[0].split("..")]
        //       if (stend.length === 1) {
        //         const start = end = stend[0];
        //       } else {
        //       start, (end = stend);
        //       }
        if (!end) {
          end = start;
        }
        return { start, end, parts: parts.slice(1) };
      })
  );
}

function buildUnicodeMap(idnaMapTable, derivedGeneralCategory) {
  console.log('Build Unicode Map');
  unicharMap = [0] * NUM_UCHAR;
  vals = [];
  console.log('... parse unicode data file (IdnaMappingTable.txt)');
  let toWrite = '';
  parseUnicodeDataFile(idnaMapTable).forEach(({ start, end, parts }) => {
    console.log({ start, end, parts });
  });
  // for ch in range(start, end + 1):
  // 	value = MappedValue(parts)
  // 	vals.append(value)
  // 	unicharMap[ch] = value
}
