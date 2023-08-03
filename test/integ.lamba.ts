#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkIntegTestStack } from '../lib/cdk_integ_test-stack';
import { IntegTest, ExpectedResult } from '@aws-cdk/integ-tests-alpha';
const crypto = require("crypto");


const app = new cdk.App();
const integTestStack = new CdkIntegTestStack(app, 'CdkIntegTestStack', {});


const integ = new IntegTest(app, 'DataFlowTest', {
  testCases: [integTestStack],
  cdkCommandOptions: {
    destroy: {
      args: {
        force: true,
      },
    },
  },
  regions: [integTestStack.region],
});


// API Callのために必要な項目を作成
const url = integTestStack.functionUrl
const id = crypto.randomUUID()
const message = "test message"
const requestBody = JSON.stringify(
  {
    "id": id,
    "message": message
  }
)


// API Callのテスト
integ.assertions.httpApiCall(
  url, {
  method: 'POST',
  body: requestBody,
}
  // レスポンスが期待通りかを確認
).expect(ExpectedResult.objectLike(
  {
    "status": 200,
    "body": { "id": id, "message": "succeeded" }
  }
)
).next(
  // API Call後にDynamoDBに格納される値が期待通りかを確認する
  integ.assertions
    // APIをCallしてDynamoDBテーブルのアイテムを取得
    .awsApiCall('DynamoDB', 'getItem', {
      TableName: integTestStack.dynamodbTableName,
      Key: { id: { S: id } },
    })
    // 取得したアイテムの値が期待通りかを確認
    .expect(
      ExpectedResult.objectLike({
        Item: {
          id: {
            S: id,
          },
          message: {
            S: message,
          }
        },
      }),
    )
    // タイムアウト設定。3秒間隔でリクエストを行い、正しい結果が25秒以内に得られなかったらタイムアウト
    .waitForAssertions({
      interval: cdk.Duration.seconds(3),
      totalTimeout: cdk.Duration.seconds(25),
    })
);

