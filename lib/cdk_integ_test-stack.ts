import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_logs as logs } from 'aws-cdk-lib';


export class CdkIntegTestStack extends cdk.Stack {


  public readonly dynamodbTableName: string
  public readonly functionName: string
  public readonly functionUrl: string

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // DynamoDB Tableを定義
    const dynamodbTable = new dynamodb.Table(this, 'SampleTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Functionを定義
    const lambdaFunction = new lambda.Function(this, 'SampleFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        'DYNAMO_DB_TABLE': dynamodbTable.tableName
      },
      logRetention: logs.RetentionDays.ONE_DAY
    })

    // Lambda Functions URLsを追加
    const functionUrl = lambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    })

    // テーブルへの書き込みを許可
    dynamodbTable.grantWriteData(lambdaFunction)

    // integ-testで使う項目
    this.dynamodbTableName = dynamodbTable.tableName
    this.functionName = lambdaFunction.functionName
    this.functionUrl = functionUrl.url
  }
}
