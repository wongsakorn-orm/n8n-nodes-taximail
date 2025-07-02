"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Taximail = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class Taximail {
    constructor() {
        this.description = {
            displayName: 'Taximail',
            name: 'taximail',
            group: ['output'],
            version: 1,
            description: 'Send Email, SMS, OTP via Taximail API with AI content generation or check status/verify OTP',
            defaults: {
                name: 'Taximail',
            },
            inputs: ['main'],
            outputs: ['main'],
            usableAsTool: true,
            icon: 'file:taximail.svg',
            credentials: [
                {
                    name: 'taximailApi',
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
                    description: 'SMS message text (not needed if using template_key, keep under 160 characters)',
                },
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
                {
                    displayName: 'Message ID',
                    name: 'verify_message_id',
                    type: 'string',
                    displayOptions: {
                        show: { operation: ['verify_otp'] },
                    },
                    default: '',
                    required: true,
                    description: 'Message ID from OTP sending response (data.message_id)',
                    placeholder: 'e.g., 63bf89390fe2f00008a236c3',
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
                    description: 'OTP code entered by user (usually 4-6 digits)',
                    placeholder: 'e.g., 123456',
                },
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
    }
    async execute() {
        const items = this.getInputData();
        const returnItems = [];
        const nodeInstance = new Taximail();
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i);
            let result;
            try {
                switch (operation) {
                    case 'email':
                        result = await nodeInstance.sendEmail(this, i);
                        break;
                    case 'sms':
                        result = await nodeInstance.sendSMS(this, i);
                        break;
                    case 'sms_otp':
                        result = await nodeInstance.sendSMSOTP(this, i);
                        break;
                    case 'verify_otp':
                        result = await nodeInstance.verifyOTP(this, i);
                        break;
                    case 'check_status':
                        result = await nodeInstance.checkStatus(this, i);
                        break;
                    default:
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `${Taximail.ERROR_MESSAGES.UNKNOWN_OPERATION}: ${operation}`);
                }
                returnItems.push({ json: result });
            }
            catch (error) {
                if (error instanceof n8n_workflow_1.NodeOperationError) {
                    throw error;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `${Taximail.ERROR_MESSAGES.OPERATION_FAILED}: ${error.message}`);
            }
        }
        return [returnItems];
    }
    generateMessageId(prefix) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}_${randomString}`;
    }
    objectToFormData(obj) {
        return Object.keys(obj)
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
    }
    async makeAuthenticatedRequest(executeFunctions, options) {
        return await executeFunctions.helpers.httpRequestWithAuthentication.call(executeFunctions, 'taximailApi', options);
    }
    async sendEmail(executeFunctions, itemIndex) {
        const toEmail = executeFunctions.getNodeParameter('to_email', itemIndex);
        const fromEmail = executeFunctions.getNodeParameter('from_email', itemIndex);
        const fromName = executeFunctions.getNodeParameter('from_name', itemIndex);
        const templateKey = executeFunctions.getNodeParameter('email_template_key', itemIndex);
        const body = {
            transactional_group_name: Taximail.DEFAULT_GROUP_NAME,
            to_name: toEmail,
            to_email: toEmail,
            from_name: fromName,
            from_email: fromEmail,
            message_id: this.generateMessageId('email'),
        };
        if (templateKey && templateKey.trim() !== '') {
            body.template_key = templateKey.trim();
        }
        else {
            const subject = executeFunctions.getNodeParameter('subject', itemIndex);
            const htmlContent = executeFunctions.getNodeParameter('html_content', itemIndex);
            body.subject = subject;
            body.content_html = htmlContent;
        }
        const options = {
            method: 'POST',
            url: Taximail.ENDPOINTS.TRANSACTIONAL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: this.objectToFormData(body),
        };
        const response = await this.makeAuthenticatedRequest(executeFunctions, options);
        return {
            ...response,
            operation: 'email',
            message_id: body.message_id,
            note: Taximail.SUCCESS_MESSAGES.SAVE_MESSAGE_ID,
        };
    }
    async sendSMS(executeFunctions, itemIndex) {
        const toPhone = executeFunctions.getNodeParameter('to_phone', itemIndex);
        const templateKey = executeFunctions.getNodeParameter('sms_template_key', itemIndex);
        const body = {
            from: Taximail.DEFAULT_FROM_SMS,
            to: toPhone,
            message_id: this.generateMessageId('sms'),
            transactional_group_name: Taximail.DEFAULT_GROUP_NAME,
            report_webhook: true,
            generate_link: true,
        };
        if (templateKey && templateKey.trim() !== '') {
            body.template_key = templateKey.trim();
        }
        else {
            const smsText = executeFunctions.getNodeParameter('sms_text', itemIndex);
            body.text = smsText;
        }
        const options = {
            method: 'POST',
            url: Taximail.ENDPOINTS.SMS,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: this.objectToFormData(body),
        };
        const response = await this.makeAuthenticatedRequest(executeFunctions, options);
        return {
            ...response,
            operation: 'sms',
            message_id: body.message_id,
            note: Taximail.SUCCESS_MESSAGES.SAVE_MESSAGE_ID,
        };
    }
    async sendSMSOTP(executeFunctions, itemIndex) {
        var _a, _b;
        const toPhone = executeFunctions.getNodeParameter('to_phone', itemIndex);
        const templateKey = executeFunctions.getNodeParameter('otp_template_key', itemIndex);
        if (!templateKey || templateKey.trim() === '') {
            throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), Taximail.ERROR_MESSAGES.OTP_TEMPLATE_REQUIRED);
        }
        const body = {
            to: toPhone,
            sms_template_key: templateKey.trim(),
            report_webhook: true,
            generate_link: true,
        };
        const options = {
            method: 'POST',
            url: Taximail.ENDPOINTS.OTP,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: this.objectToFormData(body),
        };
        const response = await this.makeAuthenticatedRequest(executeFunctions, options);
        return {
            ...response,
            operation: 'sms_otp',
            note: Taximail.SUCCESS_MESSAGES.SAVE_FOR_VERIFY,
            verification_info: {
                message_id: (_a = response.data) === null || _a === void 0 ? void 0 : _a.message_id,
                otp_ref_no: (_b = response.data) === null || _b === void 0 ? void 0 : _b.otp_ref_no,
                next_step: 'Use the message_id to verify the OTP code entered by user',
            },
        };
    }
    async verifyOTP(executeFunctions, itemIndex) {
        const messageId = executeFunctions.getNodeParameter('verify_message_id', itemIndex);
        const otpCode = executeFunctions.getNodeParameter('otp_code', itemIndex);
        if (!messageId || messageId.trim() === '') {
            throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), Taximail.ERROR_MESSAGES.MISSING_MESSAGE_ID);
        }
        if (!otpCode || otpCode.trim() === '') {
            throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), Taximail.ERROR_MESSAGES.MISSING_OTP_CODE);
        }
        const options = {
            method: 'GET',
            url: `${Taximail.ENDPOINTS.OTP_VERIFY}/${messageId.trim()}`,
            qs: {
                otp_code: otpCode.trim(),
            },
        };
        try {
            const response = await this.makeAuthenticatedRequest(executeFunctions, options);
            const isValid = response.status === 'success' && response.code === 202;
            return {
                ...response,
                operation: 'verify_otp',
                message_id: messageId,
                otp_code: otpCode,
                otp_valid: isValid,
                verification_result: isValid ? 'VALID' : 'INVALID',
                message: isValid
                    ? Taximail.SUCCESS_MESSAGES.OTP_VALID
                    : Taximail.SUCCESS_MESSAGES.OTP_INVALID,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            return {
                status: 'error',
                operation: 'verify_otp',
                message_id: messageId,
                otp_code: otpCode,
                otp_valid: false,
                verification_result: 'ERROR',
                message: Taximail.ERROR_MESSAGES.OTP_VERIFICATION_FAILED,
                error_details: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
    async checkStatus(executeFunctions, itemIndex) {
        const messageId = executeFunctions.getNodeParameter('status_message_id', itemIndex);
        const options = {
            method: 'GET',
            url: `${Taximail.ENDPOINTS.TRANSACTIONAL}/${messageId}`,
        };
        const response = await this.makeAuthenticatedRequest(executeFunctions, options);
        return {
            ...response,
            operation: 'check_status',
            message_id: messageId,
        };
    }
}
exports.Taximail = Taximail;
Taximail.BASE_API_URL = 'https://api.taximail.com';
Taximail.API_VERSION = 'v2';
Taximail.DEFAULT_FROM_SMS = 'TXSMS';
Taximail.DEFAULT_GROUP_NAME = 'Default';
Taximail.ENDPOINTS = {
    TRANSACTIONAL: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/transactional`,
    SMS: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/sms`,
    OTP: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/otp`,
    OTP_VERIFY: `${Taximail.BASE_API_URL}/${Taximail.API_VERSION}/otp/verify`,
};
Taximail.ERROR_MESSAGES = {
    OTP_TEMPLATE_REQUIRED: 'OTP SMS Template Key is required for sending OTP',
    OTP_VERIFICATION_FAILED: 'OTP verification failed - invalid code or expired',
    OPERATION_FAILED: 'Operation failed',
    UNKNOWN_OPERATION: 'Unknown operation',
    MISSING_MESSAGE_ID: 'Message ID is required for OTP verification',
    MISSING_OTP_CODE: 'OTP code is required for verification',
};
Taximail.SUCCESS_MESSAGES = {
    OTP_VALID: 'OTP verification successful - code is valid',
    OTP_INVALID: 'OTP verification failed - code is invalid or expired',
    SAVE_MESSAGE_ID: 'Save this message_id to check delivery status later',
    SAVE_FOR_VERIFY: 'Save the message_id and otp_ref_no to verify OTP later',
};
//# sourceMappingURL=Taximail.node.js.map