import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodePropertyTypes,
} from 'n8n-workflow';

export class MastodonPublish implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Mastodon Publish',
    name: 'mastodonPublish',
    icon: 'file:mastodon.svg',
    group: ['transform'],
    version: 1,
    description: 'Publish content to Mastodon',
    defaults: {
      name: 'Mastodon Publish',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'mastodonApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Status Text',
        name: 'statusText',
        type: 'string' as NodePropertyTypes,
        default: '',
        required: true,
        description: 'The text content to post (toot)',
      },
      {
        displayName: 'Visibility',
        name: 'visibility',
        type: 'options' as NodePropertyTypes,
        options: [
          { name: 'Public', value: 'public' },
          { name: 'Unlisted', value: 'unlisted' },
          { name: 'Followers Only', value: 'private' },
          { name: 'Direct', value: 'direct' },
        ],
        default: 'public',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const statusText = this.getNodeParameter('statusText', i) as string;
      const visibility = this.getNodeParameter('visibility', i) as string;

      try {
        const credentials = await this.getCredentials('mastodonApi');
        const instanceUrl = credentials.instanceUrl as string;
        
        // Mastodon API endpoint
        const url = `${instanceUrl}/api/v1/statuses`;
        const body = {
          status: statusText,
          visibility: visibility,
        };

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
            statusId: response.id,
            statusText,
            url: response.url,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error: any) {
        returnData.push({
          json: {
            success: false,
            error: error.message,
            statusText,
          },
        });
      }
    }

    return [returnData];
  }
}

