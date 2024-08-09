import { createRequire } from 'node:module';
import { ManifestTypeV3 } from './v3-type.mjs';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

const manifest: ManifestTypeV3 = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  icons: {
    '128': 'public/icon-128.png',
    '48': 'public/icon-48.png',
  },
};

function getManifestV3(pageDirMap: { [x: string]: any }): ManifestTypeV3 {
  const pages = Object.keys(pageDirMap);

  if (pages.length === 0) {
    return manifest;
  }

  if (pages.indexOf('content') > -1) {
    manifest.content_scripts = [
      {
        matches: ['https://www.backstabbr.com/game/*'],
        js: [pageDirMap['content']],
        run_at: 'document_end',
      },
    ];
  }

  return manifest;
}

export default getManifestV3;
