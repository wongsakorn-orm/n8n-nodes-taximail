import type { IAuthenticateGeneric, ICredentialType, INodeProperties, Icon, ICredentialTestRequest } from 'n8n-workflow';
export declare class TaximailApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    icon: Icon;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
