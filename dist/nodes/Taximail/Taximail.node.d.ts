import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Taximail implements INodeType {
    private static readonly BASE_API_URL;
    private static readonly API_VERSION;
    private static readonly DEFAULT_FROM_SMS;
    private static readonly DEFAULT_GROUP_NAME;
    private static readonly ENDPOINTS;
    private static readonly ERROR_MESSAGES;
    private static readonly SUCCESS_MESSAGES;
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
    private generateMessageId;
    private createRequestOptions;
    private sendEmail;
    private sendSMS;
    private sendSMSOTP;
    private verifyOTP;
    private checkStatus;
}
