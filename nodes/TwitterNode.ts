import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodePropertyTypes,
} from 'n8n-workflow';

export class TwitterPublish implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Twitter Publish',
    name: 'twitterPublish',
    icon: 'file:twitter.svg',
    group: ['transform'],
    version: 1,
    description: 'Publish content to Twitter/X',
    defaults: {
      name: 'Twitter Publish',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'twitterOAuth2Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Tweet Text',
        name: 'tweetText',
        type: 'string' as NodePropertyTypes,
        default: '',
        required: true,
        description: 'The text content to tweet',
      },
      {
        displayName: 'Media URL',
        name: 'mediaUrl',
        type: 'string' as NodePropertyTypes,
        default: '',
        required: false,
        description: 'Optional media URL to attach',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const tweetText = this.getNodeParameter('tweetText', i) as string;
      const mediaUrl = this.getNodeParameter('mediaUrl', i, '') as string;

      try {
        const credentials = await this.getCredentials('twitterOAuth2Api');
        
        // Twitter API v2 endpoint
        const url = 'https://api.twitter.com/2/tweets';
        const body: any = {
          text: tweetText,
        };

        if (mediaUrl) {
          // In production, you'd need to upload media first and get media_id
          // This is simplified - you'd need to implement media upload separately
          body.media = { media_ids: [mediaUrl] };
        }

        const response = await this.helpers.request({
          method: 'POST',
          url,
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        returnData.push({
          json: {
            success: true,
            tweetId: response.data?.id,
            tweetText,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error: any) {
        returnData.push({
          json: {
            success: false,
            error: error.message,
            tweetText,
          },
        });
      }
    }

    return [returnData];
  }
}

