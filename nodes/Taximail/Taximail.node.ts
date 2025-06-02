import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Taximail implements INodeType {
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
				name: 'httpBasicAuth',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{ name: 'Send Email', value: 'email' },
					{ name: 'Send SMS', value: 'sms' },
					{ name: 'Send SMS OTP', value: 'sms_otp' },
					{ name: 'Verify OTP', value: 'verify_otp' },
					{ name: 'Check Status', value: 'check_status' },
				],
				default: 'email',
				description: 'Choose the operation to perform',
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
				description: 'Optional: Use existing template instead of AI-generated content',
			},
			{
				displayName: 'Email Purpose/Context',
				name: 'email_context',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
					hide: { email_template_key: [{ _cnd: { not: '' } }] },
				},
				default: '',
				required: true,
				description:
					'Describe the purpose of this email (e.g., "Welcome new user", "Password reset confirmation")',
			},
			{
				displayName: 'Additional Email Details',
				name: 'email_details',
				type: 'string',
				displayOptions: {
					show: { operation: ['email'] },
					hide: { email_template_key: [{ _cnd: { not: '' } }] },
				},
				default: '',
				description: 'Any specific information to include in the email content',
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
				description: 'Optional: Use existing template instead of AI-generated content',
			},
			{
				displayName: 'SMS Purpose/Context',
				name: 'sms_context',
				type: 'string',
				displayOptions: {
					show: { operation: ['sms'] },
					hide: { sms_template_key: [{ _cnd: { not: '' } }] },
				},
				default: '',
				required: true,
				description:
					'Describe the purpose of this SMS (e.g., "Order confirmation", "Delivery notification")',
			},
			{
				displayName: 'Additional SMS Details',
				name: 'sms_details',
				type: 'string',
				displayOptions: {
					show: { operation: ['sms'] },
					hide: { sms_template_key: [{ _cnd: { not: '' } }] },
				},
				default: '',
				description: 'Any specific information to include in the SMS (keep it brief)',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('httpBasicAuth');
		const username = credentials.user as string;
		const password = credentials.password as string;

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			let options: { [key: string]: any };
			let result: any;

			try {
				switch (operation) {
					case 'email':
						result = await this.sendEmail(i, username, password);
						break;
					case 'sms':
						result = await this.sendSMS(i, username, password);
						break;
					case 'sms_otp':
						result = await this.sendSMSOTP(i, username, password);
						break;
					case 'verify_otp':
						result = await this.verifyOTP(i, username, password);
						break;
					case 'check_status':
						result = await this.checkStatus(i, username, password);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				returnItems.push({ json: result });
			} catch (error) {
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(this.getNode(), `Operation failed: ${error.message}`);
			}
		}

		return returnItems;
	}

	private async sendEmail(itemIndex: number, username: string, password: string): Promise<any> {
		const toEmail = this.getNodeParameter('to_email', itemIndex) as string;
		const fromEmail = this.getNodeParameter('from_email', itemIndex) as string;
		const fromName = this.getNodeParameter('from_name', itemIndex) as string;
		const templateKey = this.getNodeParameter('email_template_key', itemIndex) as string;

		let subject = '';
		let contentHtml = '';

		if (templateKey && templateKey.trim() !== '') {
			// Use template key
			contentHtml = '';
		} else {
			// Generate content using AI
			const context = this.getNodeParameter('email_context', itemIndex) as string;
			const details = this.getNodeParameter('email_details', itemIndex) as string;

			const aiContent = await this.generateEmailContent(context, details);
			subject = aiContent.subject;
			contentHtml = aiContent.html;
		}

		const body: any = {
			transactional_group_name: 'Default',
			subject: subject || 'Notification',
			to_name: toEmail,
			to_email: toEmail,
			from_name: fromName,
			from_email: fromEmail,
			content_html: contentHtml,
			message_id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		};

		if (templateKey && templateKey.trim() !== '') {
			body.template_key = templateKey.trim();
			delete body.content_html; // Remove content_html when using template
		}

		const options = {
			method: 'POST',
			uri: 'https://api.taximail.com/v2/transactional',
			auth: { user: username, pass: password },
			form: body,
			json: true,
		};

		const response = await this.helpers.request!(options);

		return {
			...response,
			operation: 'email',
			message_id: body.message_id,
			note: 'Save this message_id to check delivery status later',
		};
	}

	private async sendSMS(itemIndex: number, username: string, password: string): Promise<any> {
		const toPhone = this.getNodeParameter('to_phone', itemIndex) as string;
		const templateKey = this.getNodeParameter('sms_template_key', itemIndex) as string;

		let text = '';

		if (templateKey && templateKey.trim() !== '') {
			// Use template key - no text needed
		} else {
			// Generate SMS content using AI
			const context = this.getNodeParameter('sms_context', itemIndex) as string;
			const details = this.getNodeParameter('sms_details', itemIndex) as string;

			text = await this.generateSMSContent(context, details);
		}

		const body: any = {
			from: 'TXSMS',
			to: toPhone,
			message_id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			transactional_group_name: 'Default',
			report_webhook: true,
			generate_link: true,
		};

		if (templateKey && templateKey.trim() !== '') {
			body.template_key = templateKey.trim();
		} else {
			body.text = text;
		}

		const options = {
			method: 'POST',
			uri: 'https://api.taximail.com/v2/sms',
			auth: { user: username, pass: password },
			form: body,
			json: true,
		};

		const response = await this.helpers.request!(options);

		return {
			...response,
			operation: 'sms',
			message_id: body.message_id,
			note: 'Save this message_id to check delivery status later',
		};
	}

	private async sendSMSOTP(itemIndex: number, username: string, password: string): Promise<any> {
		const toPhone = this.getNodeParameter('to_phone', itemIndex) as string;
		const templateKey = this.getNodeParameter('otp_template_key', itemIndex) as string;

		if (!templateKey || templateKey.trim() === '') {
			throw new NodeOperationError(
				this.getNode(),
				'OTP SMS Template Key is required for sending OTP',
			);
		}

		const body = {
			to: toPhone,
			sms_template_key: templateKey.trim(),
			report_webhook: true,
			generate_link: true,
		};

		const options = {
			method: 'POST',
			uri: 'https://api.taximail.com/v2/otp',
			auth: { user: username, pass: password },
			form: body,
			json: true,
		};

		const response = await this.helpers.request!(options);

		return {
			...response,
			operation: 'sms_otp',
			note: 'Save the message_id to verify OTP later',
		};
	}

	private async verifyOTP(itemIndex: number, username: string, password: string): Promise<any> {
		const messageId = this.getNodeParameter('verify_message_id', itemIndex) as string;
		const otpCode = this.getNodeParameter('otp_code', itemIndex) as string;

		const options = {
			method: 'GET',
			uri: `https://api.taximail.com/v2/otp/verify/${messageId}?otp_code=${otpCode}`,
			auth: { user: username, pass: password },
			json: true,
		};

		const response = await this.helpers.request!(options);

		const isValid = response.status === 'success' && response.code === 202;

		return {
			...response,
			operation: 'verify_otp',
			otp_valid: isValid,
			message: isValid ? 'OTP verification successful' : 'OTP verification failed',
		};
	}

	private async checkStatus(itemIndex: number, username: string, password: string): Promise<any> {
		const messageId = this.getNodeParameter('status_message_id', itemIndex) as string;

		const options = {
			method: 'GET',
			uri: `https://api.taximail.com/v2/transactional/${messageId}`,
			auth: { user: username, pass: password },
			json: true,
		};

		const response = await this.helpers.request!(options);

		return {
			...response,
			operation: 'check_status',
			message_id: messageId,
		};
	}

	private async generateEmailContent(
		context: string,
		details: string,
	): Promise<{ subject: string; html: string }> {
		// AI prompt for email content generation
		const prompt = `Generate professional email content for: ${context}
		
Additional details: ${details}

Please provide:
1. A clear, professional subject line
2. HTML email content that is well-formatted and professional

Keep the tone professional but friendly. Make it concise and to the point.`;

		try {
			// This would integrate with an AI service - for now, return a template
			const subject = this.generateSubjectFromContext(context);
			const html = this.generateHTMLFromContext(context, details);

			return { subject, html };
		} catch (error) {
			// Fallback to basic template
			return {
				subject: `Notification: ${context}`,
				html: `<html><body><h2>${context}</h2><p>${details || 'Thank you for your attention.'}</p></body></html>`,
			};
		}
	}

	private async generateSMSContent(context: string, details: string): Promise<string> {
		// AI prompt for SMS content generation
		const prompt = `Generate a concise SMS message for: ${context}
		
Additional details: ${details}

Requirements:
- Keep it under 160 characters
- Be clear and direct
- Include essential information only
- Professional but friendly tone`;

		try {
			// This would integrate with an AI service - for now, return a template
			return this.generateSMSFromContext(context, details);
		} catch (error) {
			// Fallback to basic template
			const baseMessage = `${context}${details ? ': ' + details : ''}`;
			return baseMessage.length > 160 ? baseMessage.substring(0, 157) + '...' : baseMessage;
		}
	}

	private generateSubjectFromContext(context: string): string {
		const contextLower = context.toLowerCase();

		if (contextLower.includes('welcome')) return 'Welcome! Your account is ready';
		if (contextLower.includes('reset') || contextLower.includes('password'))
			return 'Password Reset Request';
		if (contextLower.includes('confirm')) return 'Please confirm your action';
		if (contextLower.includes('order')) return 'Order Confirmation';
		if (contextLower.includes('invoice')) return 'Invoice Available';
		if (contextLower.includes('reminder')) return 'Important Reminder';

		return `Notification: ${context}`;
	}

	private generateHTMLFromContext(context: string, details: string): string {
		const contextLower = context.toLowerCase();

		let content = `<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">`;
		content += `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">`;

		if (contextLower.includes('welcome')) {
			content += `<h2 style="color: #2c5aa0;">Welcome!</h2>`;
			content += `<p>Thank you for joining us. Your account has been successfully created.</p>`;
		} else if (contextLower.includes('reset') || contextLower.includes('password')) {
			content += `<h2 style="color: #d9534f;">Password Reset Request</h2>`;
			content += `<p>We received a request to reset your password. Please follow the instructions to proceed.</p>`;
		} else if (contextLower.includes('confirm')) {
			content += `<h2 style="color: #f0ad4e;">Confirmation Required</h2>`;
			content += `<p>Please confirm your recent action to complete the process.</p>`;
		} else {
			content += `<h2 style="color: #5cb85c;">${context}</h2>`;
			content += `<p>This is an important notification regarding your account.</p>`;
		}

		if (details) {
			content += `<div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">`;
			content += `<p><strong>Details:</strong> ${details}</p>`;
			content += `</div>`;
		}

		content += `<p style="margin-top: 30px;">Best regards,<br>Your Team</p>`;
		content += `</div></body></html>`;

		return content;
	}

	private generateSMSFromContext(context: string, details: string): string {
		const contextLower = context.toLowerCase();

		if (contextLower.includes('welcome')) {
			return `Welcome! Your account is ready. ${details || 'Thank you for joining us.'}`.substring(
				0,
				160,
			);
		}
		if (contextLower.includes('order')) {
			return `Order confirmed. ${details || 'You will receive updates soon.'}`.substring(0, 160);
		}
		if (contextLower.includes('delivery')) {
			return `Delivery update: ${details || 'Your order is on the way.'}`.substring(0, 160);
		}
		if (contextLower.includes('reminder')) {
			return `Reminder: ${details || context}`.substring(0, 160);
		}

		const message = `${context}${details ? ': ' + details : ''}`;
		return message.length > 160 ? message.substring(0, 157) + '...' : message;
	}
}
