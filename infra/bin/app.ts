#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { YtchapterCertStack, YtchapterStack } from '../lib/ytchapter-stack';

const app = new cdk.App();
const account = '778021795831';

const certStack = new YtchapterCertStack(app, 'YtchapterCert', {
  env: { account, region: 'us-east-1' },
  crossRegionReferences: true,
});

const siteStack = new YtchapterStack(app, 'Ytchapter', {
  env: { account, region: 'ap-northeast-2' },
  crossRegionReferences: true,
  certificate: certStack.certificate,
});

siteStack.addDependency(certStack);
