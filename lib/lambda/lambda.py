import json
import os
import boto3

client = boto3.client('dynamodb')
table_name = os.environ['DYNAMO_DB_TABLE']


def handler(event, context):
    print(event)

    body = json.loads(event['body'])
    id = body['id']
    message = body['message']

    item = {
        "id": {"S": id},
        "message": {"S": message}
    }

    client.put_item(TableName=table_name, Item=item)

    result = json.dumps(
        {
            'id': id,
            'message': 'succeeded'
        })

    print(result)

    return {
        'statusCode': 200,
        'body': result
    }
