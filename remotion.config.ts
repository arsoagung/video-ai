import { Config } from '@remotion/cli/config';
import fs from 'fs';

// Path Chromium khusus mesin cloud; di Mac (path tidak ada) Remotion mengunduh/memakai browsernya sendiri.
const CLOUD_CHROME = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
if (fs.existsSync(CLOUD_CHROME)) {
  Config.setBrowserExecutable(CLOUD_CHROME);
  Config.setChromiumOpenGlRenderer('swangle');
}
