module.exports = {
  callingAPI: {
    input: '../openapi.yaml',
    output: {
      target: './src/services/api/client.ts',
      schemas: './src/services/api/model',
      mode: 'split',
      client: 'axios',
      mock: false,
    },
  },
};
