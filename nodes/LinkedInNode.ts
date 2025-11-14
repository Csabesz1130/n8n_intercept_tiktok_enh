import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodePropertyTypes,
} from 'n8n-workflow';

export class LinkedInPublish implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LinkedIn Publish',
    name: 'linkedInPublish',
    icon: 'file:linkedin.svg',
    group: ['transform'],
    version: 1,
    description: 'Publish content to LinkedIn',
    defaults: {
      name: 'LinkedIn Publish',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'linkedInOAuth2Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Post Text',
        name: 'postText',
        type: 'string' as NodePropertyTypes,
        default: '',
        required: true,
        description: 'The text content to post',
      },
      {
        displayName: 'Visibility',
        name: 'visibility',
        type: 'options' as NodePropertyTypes,
        options: [
          { name: 'Public', value: 'PUBLIC' },
          { name: 'Connections', value: 'CONNECTIONS' },
        ],
        default: 'PUBLIC',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const postText = this.getNodeParameter('postText', i) as string;
      const visibility = this.getNodeParameter('visibility', i) as string;

      try {
        const credentials = await this.getCredentials('linkedInOAuth2Api');
        
        // LinkedIn API endpoint
        const url = 'https://api.linkedin.com/v2/ugcPosts';
        const body = {
          author: `urn:li:person:${credentials.personId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: postText,
              },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': visibility,
          },
        };

        const response = await this.helpers.request({
          method: 'POST',
          url,
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify(body),
        });

        returnData.push({
          json: {
            success: true,
            postId: response.id,
            postText,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error: any) {
        returnData.push({
          json: {
            success: false,
            error: error.message,
            postText,
          },
        });
      }
    }

    return [returnData];
  }
}

