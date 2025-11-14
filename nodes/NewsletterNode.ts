import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodePropertyTypes,
} from 'n8n-workflow';

export class NewsletterPublish implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Newsletter Publish',
    name: 'newsletterPublish',
    icon: 'file:mail.svg',
    group: ['transform'],
    version: 1,
    description: 'Send newsletter via Mailchimp or SendGrid',
    defaults: {
      name: 'Newsletter Publish',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'mailchimpApi',
        required: false,
      },
      {
        name: 'sendGridApi',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Provider',
        name: 'provider',
        type: 'options' as NodePropertyTypes,
        options: [
          { name: 'Mailchimp', value: 'mailchimp' },
          { name: 'SendGrid', value: 'sendgrid' },
        ],
        default: 'mailchimp',
        required: true,
      },
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string' as NodePropertyTypes,
        default: '',
        required: true,
        description: 'Email subject line',
      },
      {
        displayName: 'HTML Content',
        name: 'htmlContent',
        type: 'string' as NodePropertyTypes,
        default: '',
        required: true,
        description: 'HTML content of the newsletter',
      },
      {
        displayName: 'List ID',
        name: 'listId',
        type: 'string' as NodePropertyTypes,
        default: '',
        required: true,
        description: 'Mailchimp list ID or SendGrid list ID',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const provider = this.getNodeParameter('provider', i) as string;
      const subject = this.getNodeParameter('subject', i) as string;
      const htmlContent = this.getNodeParameter('htmlContent', i) as string;
      const listId = this.getNodeParameter('listId', i) as string;

      try {
        if (provider === 'mailchimp') {
          const credentials = await this.getCredentials('mailchimpApi');
          const apiKey = credentials.apiKey as string;
          const [_, dataCenter] = apiKey.split('-');
          
          const url = `https://${dataCenter}.api.mailchimp.com/3.0/campaigns`;
          const body = {
            type: 'regular',
            recipients: {
              list_id: listId,
            },
            settings: {
              subject_line: subject,
              from_name: credentials.fromName || 'Newsletter',
              reply_to: credentials.replyTo || credentials.email,
            },
          };

          const campaign = await this.helpers.request({
            method: 'POST',
            url,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          // Set content
          await this.helpers.request({
            method: 'PUT',
            url: `${url}/${campaign.id}/content`,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              html: htmlContent,
            }),
          });

          // Send
          await this.helpers.request({
            method: 'POST',
            url: `${url}/${campaign.id}/actions/send`,
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });

          returnData.push({
            json: {
              success: true,
              provider: 'mailchimp',
              campaignId: campaign.id,
              subject,
              timestamp: new Date().toISOString(),
            },
          });
        } else if (provider === 'sendgrid') {
          const credentials = await this.getCredentials('sendGridApi');
          
          const url = 'https://api.sendgrid.com/v3/mail/send';
          const body = {
            personalizations: [
              {
                to: [{ email: listId }], // In production, fetch list members
                subject: subject,
              },
            ],
            from: {
              email: credentials.fromEmail || 'noreply@example.com',
              name: credentials.fromName || 'Newsletter',
            },
            content: [
              {
                type: 'text/html',
                value: htmlContent,
              },
            ],
          };

          await this.helpers.request({
            method: 'POST',
            url,
            headers: {
              Authorization: `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          returnData.push({
            json: {
              success: true,
              provider: 'sendgrid',
              subject,
              timestamp: new Date().toISOString(),
            },
          });
        }
      } catch (error: any) {
        returnData.push({
          json: {
            success: false,
            error: error.message,
            provider,
            subject,
          },
        });
      }
    }

    return [returnData];
  }
}

