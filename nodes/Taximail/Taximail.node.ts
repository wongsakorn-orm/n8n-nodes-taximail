import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class Taximail implements INodeType {
	// Constants
	private static readonly BASE_API_URL = 'https://api.taximail.com';
	private static readonly API_VERSION = 'v2';
	private static readonly DEFAULT_FROM_SMS = 'TXSMS';
	private static readonly DEFAULT_GROUP_NAME = 'Default';

	// API Endpoints
	private static readonly ENDPOINTS = {
		TRANSACTIONAL: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/transactional`,
		SMS: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/sms`,
		OTP: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/otp`,
		OTP_VERIFY: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/otp/verify`,
	};

	// Error Messages
	private static readonly ERROR_MESSAGES = {
		OTP_TEMPLATE_REQUIRED: 'OTP SMS Template Key is required for sending OTP',
		OPERATION_FAILED: 'Operation failed',
		UNKNOWN_OPERATION: 'Unknown operation',
	};

	// Success Messages
	private static readonly SUCCESS_MESSAGES = {
		OTP_VALID: 'OTP verification successful',
		OTP_INVALID: 'OTP verification failed',
		SAVE_MESSAGE_ID: 'Save this message_id to check delivery status later',
		SAVE_FOR_VERIFY: 'Save the message_id to verify OTP later',
	};

	description: INodeTypeDescription = {
		displayName: 'Taximail',
		name: 'taximail',
		group: ['output'],
		version: 1,
		description:
			'Send Email, SMS, OTP via Taximail API with AI content generation or check status/verify OTP',
		defaults: {
			name: 'Taximail',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		icon: 'file:taximail.svg',
		credentials: [
			{
				/* eslint-disable-next-line n8n-nodes-base/node-class-description-credentials-name-unsuffixed */
				name: 'httpBasicAuth',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Check Status', value: 'check_status' },
					{ name: 'Send Email', value: 'email' },
					{ name: 'Send SMS', value: 'sms' },
					{ name: 'Send SMS OTP', value: 'sms_otp' },
					{ name: 'Verify OTP', value: 'verify_otp' },
				],
				default: 'email',
			},

			// Email fields
			{
				displayName: 'To Email',
				name: 'to_email',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
				},
				default: '',
				required: true,
				description: 'Recipient email address',
			},
			{
				displayName: 'From Email',
				name: 'from_email',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
				},
				default: '',
				required: true,
				description: 'Sender email address',
			},
			{
				displayName: 'From Name',
				name: 'from_name',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
				},
				default: '',
				required: true,
				description: 'Sender name',
			},
			{
				displayName: 'Email Template Key',
				name: 'email_template_key',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
				},
				default: '',
				description: 'Optional: Use existing template instead of custom content',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
				},
				default: '',
				description: 'Email subject line (not needed if using template_key)',
			},
			{
				displayName: 'HTML Content',
				name: 'html_content',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
				},
				default: '',
				description: 'HTML email content (not needed if using template_key)',
			},

			// SMS fields
			{
				displayName: 'To Phone (MSISDN)',
				name: 'to_phone',
				type: 'string',
				displayOptions: {
					show: { operation: ['sms', 'sms_otp'] },
				},
				default: '',
				required: true,
				description: 'Recipient phone number with country code (e.g., 66812345678)',
			},
			{
				displayName: 'SMS Template Key',
				name: 'sms_template_key',
				type: 'string',
				displayOptions: {
					show: { operation: ['sms'] },
				},
				default: '',
				description: 'Optional: Use existing template instead of custom text',
			},
			{
				displayName: 'SMS Text',
				name: 'sms_text',
				type: 'string',
				displayOptions: {
					show: { operation: ['sms'] },
				},
				default: '',
				description:
					'SMS message text (not needed if using template_key, keep under 160 characters)',
			},

			// SMS OTP fields
			{
				displayName: 'OTP SMS Template Key',
				name: 'otp_template_key',
				type: 'string',
				displayOptions: {
					show: { operation: ['sms_otp'] },
				},
				default: '',
				required: true,
				description: 'Template key for OTP SMS (required for OTP sending)',
			},

			// Verify OTP fields
			{
				displayName: 'Message ID',
				name: 'verify_message_id',
				type: 'string',
				displayOptions: {
					show: { operation: ['verify_otp'] },
				},
				default: '',
				required: true,
				description: 'Message ID from OTP sending response',
			},
			{
				displayName: 'OTP Code',
				name: 'otp_code',
				type: 'string',
				displayOptions: {
					show: { operation: ['verify_otp'] },
				},
				default: '',
				required: true,
				description: 'OTP code to verify',
			},

			// Check status fields
			{
				displayName: 'Message ID',
				name: 'status_message_id',
				type: 'string',
				displayOptions: {
					show: { operation: ['check_status'] },
				},
				default: '',
				required: true,
				description: 'Message ID to check status for',
			},
		],
		codex: {
			categories: ['AI Agent Tools'],
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('httpBasicAuth');
		const username = credentials.user as string;
		const password = credentials.password as string;

		const nodeInstance = new Taximail();

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			let result: any;

			try {
				switch (operation) {
					case 'email':
						result = await nodeInstance.sendEmail(this, i, username, password);
						break;
					case 'sms':
						result = await nodeInstance.sendSMS(this, i, username, password);
						break;
					case 'sms_otp':
						result = await nodeInstance.sendSMSOTP(this, i, username, password);
						break;
					case 'verify_otp':
						result = await nodeInstance.verifyOTP(this, i, username, password);
						break;
					case 'check_status':
						result = await nodeInstance.checkStatus(this, i, username, password);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`${Taximail.ERROR_MESSAGES.UNKNOWN_OPERATION}: ${operation}`,
						);
				}

				returnItems.push({ json: result });
			} catch (error) {
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(
					this.getNode(),
					`${Taximail.ERROR_MESSAGES.OPERATION_FAILED}: ${error.message}`,
				);
			}
		}

		return [returnItems];
	}

	/**
	 * Generate unique message ID
	 */
	private generateMessageId(prefix: string): string {
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substr(2, 9);
		return `${prefix}_${timestamp}_${randomString}`;
	}

	/**
	 * Create request options for API calls
	 */
	private createRequestOptions(
		method: IHttpRequestMethods,
		endpoint: string,
		username: string,
		password: string,
		body?: any,
	) {
		const options: any = {
			method,
			uri: endpoint,
			auth: { user: username, pass: password },
			json: true,
		};

		if (body) {
			options.form = body;
		}

		return options;
	}

	private async sendEmail(
		executeFunctions: IExecuteFunctions,
		itemIndex: number,
		username: string,
		password: string,
	): Promise<any> {
		const toEmail = executeFunctions.getNodeParameter('to_email', itemIndex) as string;
		const fromEmail = executeFunctions.getNodeParameter('from_email', itemIndex) as string;
		const fromName = executeFunctions.getNodeParameter('from_name', itemIndex) as string;
		const templateKey = executeFunctions.getNodeParameter(
			'email_template_key',
			itemIndex,
		) as string;

		const body: any = {
			transactional_group_name: Taximail.DEFAULT_GROUP_NAME,
			to_name: toEmail,
			to_email: toEmail,
			from_name: fromName,
			from_email: fromEmail,
			message_id: this.generateMessageId('email'),
		};

		if (templateKey && templateKey.trim() !== '') {
			// Use template key
			body.template_key = templateKey.trim();
		} else {
			// Use custom content
			const subject = executeFunctions.getNodeParameter('subject', itemIndex) as string;
			const htmlContent = executeFunctions.getNodeParameter('html_content', itemIndex) as string;

			body.subject = subject;
			body.content_html = htmlContent;
		}

		const options = this.createRequestOptions(
			'POST',
			Taximail.ENDPOINTS.TRANSACTIONAL,
			username,
			password,
			body,
		);
		const response = await executeFunctions.helpers.request!(options);

		return {
			...response,
			operation: 'email',
			message_id: body.message_id,
			note: Taximail.SUCCESS_MESSAGES.SAVE_MESSAGE_ID,
		};
	}

	private async sendSMS(
		executeFunctions: IExecuteFunctions,
		itemIndex: number,
		username: string,
		password: string,
	): Promise<any> {
		const toPhone = executeFunctions.getNodeParameter('to_phone', itemIndex) as string;
		const templateKey = executeFunctions.getNodeParameter('sms_template_key', itemIndex) as string;

		const body: any = {
			from: Taximail.DEFAULT_FROM_SMS,
			to: toPhone,
			message_id: this.generateMessageId('sms'),
			transactional_group_name: Taximail.DEFAULT_GROUP_NAME,
			report_webhook: true,
			generate_link: true,
		};

		if (templateKey && templateKey.trim() !== '') {
			// Use template key
			body.template_key = templateKey.trim();
		} else {
			// Use custom text
			const smsText = executeFunctions.getNodeParameter('sms_text', itemIndex) as string;
			body.text = smsText;
		}

		const options = this.createRequestOptions(
			'POST',
			Taximail.ENDPOINTS.SMS,
			username,
			password,
			body,
		);
		const response = await executeFunctions.helpers.request!(options);

		return {
			...response,
			operation: 'sms',
			message_id: body.message_id,
			note: Taximail.SUCCESS_MESSAGES.SAVE_MESSAGE_ID,
		};
	}

	private async sendSMSOTP(
		executeFunctions: IExecuteFunctions,
		itemIndex: number,
		username: string,
		password: string,
	): Promise<any> {
		const toPhone = executeFunctions.getNodeParameter('to_phone', itemIndex) as string;
		const templateKey = executeFunctions.getNodeParameter('otp_template_key', itemIndex) as string;

		if (!templateKey || templateKey.trim() === '') {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				Taximail.ERROR_MESSAGES.OTP_TEMPLATE_REQUIRED,
			);
		}

		const body = {
			to: toPhone,
			sms_template_key: templateKey.trim(),
			report_webhook: true,
			generate_link: true,
		};

		const options = this.createRequestOptions(
			'POST',
			Taximail.ENDPOINTS.OTP,
			username,
			password,
			body,
		);
		const response = await executeFunctions.helpers.request!(options);

		return {
			...response,
			operation: 'sms_otp',
			note: Taximail.SUCCESS_MESSAGES.SAVE_FOR_VERIFY,
		};
	}

	private async verifyOTP(
		executeFunctions: IExecuteFunctions,
		itemIndex: number,
		username: string,
		password: string,
	): Promise<any> {
		const messageId = executeFunctions.getNodeParameter('verify_message_id', itemIndex) as string;
		const otpCode = executeFunctions.getNodeParameter('otp_code', itemIndex) as string;

		const endpoint = `${Taximail.ENDPOINTS.OTP_VERIFY}/${messageId}?otp_code=${otpCode}`;
		const options = this.createRequestOptions('GET', endpoint, username, password);
		const response = await executeFunctions.helpers.request!(options);

		const isValid = response.status === 'success' && response.code === 202;

		return {
			...response,
			operation: 'verify_otp',
			otp_valid: isValid,
			message: isValid
				? Taximail.SUCCESS_MESSAGES.OTP_VALID
				: Taximail.SUCCESS_MESSAGES.OTP_INVALID,
		};
	}

	private async checkStatus(
		executeFunctions: IExecuteFunctions,
		itemIndex: number,
		username: string,
		password: string,
	): Promise<any> {
		const messageId = executeFunctions.getNodeParameter('status_message_id', itemIndex) as string;

		const endpoint = `${Taximail.ENDPOINTS.TRANSACTIONAL}/${messageId}`;
		const options = this.createRequestOptions('GET', endpoint, username, password);
		const response = await executeFunctions.helpers.request!(options);

		return {
			...response,
			operation: 'check_status',
			message_id: messageId,
		};
	}
}
