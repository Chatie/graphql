import * as fs    from 'fs'
import * as path  from 'path'

const FIXTURE_GRAPHCOOL_INFO_FILE = path.join(__dirname, 'graphcool-info.txt')

export function* graphcoolInfoFixture() {
  const EXPECTED_INFO_TEXT    = fs.readFileSync(FIXTURE_GRAPHCOOL_INFO_FILE).toString()
  const EXPECTED_ID_FROM_FILE = 'cje8q7go30004017072lm7r5f'

  yield {
    info: EXPECTED_INFO_TEXT,
    simple: `http://localhost:60000/simple/v1/${EXPECTED_ID_FROM_FILE}`,
    relay:  `http://localhost:60000/relay/v1/${EXPECTED_ID_FROM_FILE}`,
    subscriptions: `ws://localhost:60000/subscriptions/v1/${EXPECTED_ID_FROM_FILE}`,
    system: 'http://localhost:60000/system',
    serviceId: EXPECTED_ID_FROM_FILE,
  }

}
