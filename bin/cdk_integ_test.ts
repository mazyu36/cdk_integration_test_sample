#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkIntegTestStack } from '../lib/cdk_integ_test-stack';

const app = new cdk.App();
new CdkIntegTestStack(app, 'CdkIntegTestStack', {});