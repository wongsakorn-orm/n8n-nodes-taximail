import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';

export class Taximail implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Send Email (Taximail)',
		name: 'taximail',
		group: ['output'],
		version: 1,
		description: 'Send transactional email using Taximail API',
		defaults: {
			name: 'Send Email',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		icon: 'file:taximail.svg',
		credentials: [
			{
				name: 'httpBasicAuth-Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'To Email',
				name: 'to_email',
				type: 'string',
				default: '',
				description: 'Email address of the recipient',
			},
			{
				displayName: 'From Name',
				name: 'from_name',
				type: 'string',
				default: 'Taximail',
				description: 'Name of the sender',
			},
			{
				displayName: 'From Email',
				name: 'from_email',
				type: 'string',
				default: '',
				description: 'Email address of the sender',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Subject of the email',
			},
			{
				displayName: 'HTML Content',
				name: 'content_html',
				type: 'string',
				default: '',
				typeOptions: {
					rows: 5,
				},
				description: 'The HTML content of the email to be sent',
			},
		],
		codex: {
			categories: ['AI Agent Tools'],
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnItems = [];
		const credentials = await this.getCredentials('httpBasicAuth-Api');
		const username = credentials.user as string;
		const password = credentials.password as string;

		for (let i = 0; i < items.length; i++) {
			const to = this.getNodeParameter('to_email', i) as string;
			const from = this.getNodeParameter('from_email', i) as string;
			const fromName = this.getNodeParameter('from_name', i) as string;
			const subject = this.getNodeParameter('subject', i) as string;
			const html = this.getNodeParameter('content_html', i) as string;

			if (!to || !from || !fromName || !subject || !html) {
				throw new NodeOperationError(
					this.getNode(),
					'Missing required fields: to_email, from_email, from_name, subject, or content_html',
				);
			}

			const body = {
				transactional_group_name: 'Default',
				subject,
				to_name: to,
				to_email: to,
				from_name: fromName,
				from_email: from,
				content_html: html,
			};

			const options: IHttpRequestOptions = {
				method: 'POST',
				url: 'https://api.taximail.com/v2/transactional',
				auth: {
					username,
					password,
				},
				body,
				json: true,
			};

			const response = await this.helpers.httpRequest(options);
			returnItems.push({ json: response });
		}

		return this.prepareOutputData(returnItems);
	}
}
