const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { AWSXRayIdGenerator } = require('@opentelemetry/sdk-trace-aws-xray');

const sdk = new NodeSDK({
  idGenerator: new AWSXRayIdGenerator(),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();