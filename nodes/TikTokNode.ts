import { IExecuteFunctions } from 'n8n-workflow';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class TikTokNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'TikTok Publisher',
    name: 'tikTokNode',
    group: ['transform'],
    version: 1,
    description: 'Publishes content to TikTok',
    defaults: {
      name: 'TikTok Publisher',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        default: '',
        placeholder: 'Enter content to publish',
        description: 'The text content to publish to TikTok',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const content = this.getNodeParameter('content', 0, '') as string;
    
    // In a real implementation, you would use the TikTok API to publish the content.
    // For this example, we'll return a mock success message.
    const mockResponse = {
      success: true,
      message: `Successfully published: "${content}"`,
    };

    return this.prepareOutputData([{ json: mockResponse }]);
  }
}
