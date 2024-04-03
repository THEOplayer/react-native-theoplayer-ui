/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ['src/index.tsx'],
  tsconfig: 'tsconfig.build.json',
  out: 'api',
  sitemapBaseUrl: 'https://theoplayer.github.io/react-native-theoplayer-ui/api/',
  name: 'React Native THEOplayer UI',
  readme: 'none',
  plugin: ['typedoc-plugin-external-resolver', 'typedoc-plugin-mdn-links'],
  navigationLinks: {
    Docs: 'https://www.theoplayer.com/docs/',
    'THEOplayer.com': 'https://www.theoplayer.com/',
  },
  githubPages: true,
  excludePrivate: true,
  excludeInternal: true,
  excludeExternals: true,
  externalDocumentation: {
    theoplayer: {
      dtsPath: '~/THEOplayer.d.ts',
      externalBaseURL: 'https://www.theoplayer.com/docs/theoplayer/v6/api-reference/web',
    },
    'react-native-theoplayer': {
      dtsPath: '~/lib/typescript/index.d.ts',
      externalBaseURL: 'https://theoplayer.github.io/react-native-theoplayer/api',
    },
  },
};
