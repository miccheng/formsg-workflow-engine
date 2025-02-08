import { metadataMatchingActivity } from './metadata-matching-activity';
import { MockActivityEnvironment } from '@temporalio/testing';

describe('metadataMatchingActivity', () => {
  let mockTemporalEnv: MockActivityEnvironment;

  beforeEach(() => {
    mockTemporalEnv = new MockActivityEnvironment({ attempt: 2 });
  });

  it.each([
    ['', { name: 'Michael' }, { name: [] }],
    [
      ['michael cheng', 'merissa cheng'],
      { name: 'Michael' },
      {
        name: [
          {
            item: 'michael cheng',
            refIndex: 0,
            score: 0.007568328950209746,
          },
        ],
      },
    ],
    [
      ['michael cheng', 'merissa teo', 'jerry chang'],
      { name: 'Michael Cheng' },
      {
        name: [
          {
            item: 'michael cheng',
            refIndex: 0,
            score: 0,
          },
        ],
      },
    ],
    [
      `michael cheng
    merissa teo
    jerry chang`,
      { name: 'Michael Cheng' },
      {
        name: [
          {
            item: 'michael cheng',
            refIndex: 0,
            score: 0,
          },
        ],
      },
    ],
    [
      `UTOPIA VISA
ZENITH 10 DEC/DEC 11 10 DEC/DEC 16
3 MULTIPLE Mr2sesoses
ol BUSINESS MULTIPLE
” «© ~b [2 RFCLLE REGIRUT IEUPRLY SN AY RENMET 9 SRY
- ERIKSSON ANNA MARIA
A ~~ J
: 4 Prioisne NooRue We asaeod So de Dineen B57 Dati be rt, sad ate rsa)
/ I L8988901C F/F 07 SEP/SEP 86 XXX
h “John Doe
VKUTOERIKSSON<K<KANNA<KMARIA<KLLLKLLKLLKLKKLKLK
LEFEB8F0TCLXXXL009078F9612109<<K<K<KLKLKKLKL
`,
      { name: 'eriksson anna maria', passport: 'L8988901C' },
      {
        name: [
          {
            item: '- ERIKSSON ANNA MARIA',
            refIndex: 5,
            score: 0.1414213562373095,
          },
          {
            item: 'VKUTOERIKSSON<K<KANNA<KMARIA<KLLLKLLKLLKLKKLKLK',
            refIndex: 10,
            score: 0.3657894736842105,
          },
        ],
        passport: [
          {
            item: '/ I L8988901C F/F 07 SEP/SEP 86 XXX',
            refIndex: 8,
            score: 0.31998471754414587,
          },
        ],
      },
    ],
  ])('should match %s', async (metadata, search, expected) => {
    expect(
      await mockTemporalEnv.run(metadataMatchingActivity, metadata, search)
    ).toEqual(expected);
  });
});
