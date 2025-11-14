// Type declarations for n8n-workflow
// These types are provided by n8n when nodes are loaded in the n8n environment
// For development purposes, these declarations allow TypeScript to compile

declare module 'n8n-workflow' {
  export interface IExecuteFunctions {
    getInputData(): INodeExecutionData[];
    getNodeParameter(parameterName: string, itemIndex: number, fallbackValue?: any): any;
    getCredentials(type: string): Promise<any>;
    helpers: {
      request(options: any): Promise<any>;
    };
  }

  export interface INodeExecutionData {
    json: { [key: string]: any };
    binary?: { [key: string]: any };
  }

  export interface INodeType {
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
  }

  export interface INodeTypeDescription {
    displayName: string;
    name: string;
    icon?: string;
    group: string[];
    version: number;
    description: string;
    defaults: {
      name: string;
    };
    inputs: string[];
    outputs: string[];
    credentials?: Array<{
      name: string;
      required: boolean;
    }>;
    properties: INodeProperty[];
  }

  export interface INodeProperty {
    displayName: string;
    name: string;
    type: string;
    default?: any;
    required?: boolean;
    description?: string;
    options?: Array<{ name: string; value: any }>;
  }

  export type NodePropertyTypes = 
    | 'string'
    | 'number'
    | 'boolean'
    | 'options'
    | 'multiOptions'
    | 'collection'
    | 'dateTime'
    | 'json';
}

