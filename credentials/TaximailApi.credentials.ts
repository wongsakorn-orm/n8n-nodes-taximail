import type {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	Icon,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class TaximailApi implements ICredentialType {
	name = 'taximailApi';
	displayName = 'Taximail API';
	documentationUrl = 'https://taximail.com/docs';
	icon: Icon = 'file:taximail.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Taximail API Key from the Integration section',
		},
		{
			displayName: 'Secret Key',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Taximail Secret Key from the Integration section',
		},
	];

	// Define how authentication is handled
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	// Test endpoint to verify credentials work - get transactional groups
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.taximail.com',
			url: '/v2/transactional',
			method: 'GET',
		},
	};
}
