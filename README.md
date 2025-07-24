# n8n-nodes-taximail

This is an n8n community node. It lets you use **Taximail** in your n8n AI Agent workflows as a Tool.

**Taximail** is a communication service for sending transactional emails and SMS globally. This node allows AI Agents to send messages via Taximail, verify OTP codes, and check message delivery status with intelligent context awareness.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[AI Agent Configuration](#ai-agent-configuration)  
[Resources](#resources)

---

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Once installed, the `Taximail` node will be available as a **Tool** for AI Agent nodes to use directly.

---

## Operations

- **Send Email**: Send transactional emails via Taximail (with `template_key` or custom content).
- **Send SMS**: Send SMS via Taximail (with `template_key` or custom text).
- **Send SMS OTP**: Send OTP verification codes via SMS (requires `template_key`).
- **Verify OTP**: Verify OTP codes entered by users.
- **Check Status**: Check delivery status of sent messages.

---

## Credentials

You will need **Taximail API credentials** to use this node.

### Getting Your API Credentials:

1. Sign up or log in at [https://www.taximail.com](https://www.taximail.com)
2. Navigate to the Integration section in your dashboard
3. Generate your API Key and Secret Key
4. Follow this guide for detailed steps:  
   [https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations](https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations)

### Adding Credentials in n8n:

1. In n8n, create a new credential
2. Select **"Taximail API"** as the credential type
3. Enter your credentials:
   - **API Key**: Your Taximail API Key from the Integration section
   - **Secret Key**: Your Taximail Secret Key from the Integration section

---

## Compatibility

- Minimum n8n version: `1.45.0` (with AI Agent Tool support)
- Tested on: `1.45.0`, `1.46.0`
- No known incompatibilities

---

## Usage

This node is designed to be used with **AI Agents** in n8n with intelligent context handling.

### Email Operations:

- **Send Email**: Requires recipient email, sender email, sender name, and either:
  - A `template_key` for using a pre-defined template, or
  - Custom subject and HTML content
- Returns a `message_id` that can be used to check delivery status later

### SMS Operations:

- **Send SMS**: Requires recipient phone number (MSISDN format with country code) and either:
  - A `template_key` for using a pre-defined template, or
  - Custom SMS text (keep under 160 characters)
- Returns a `message_id` that can be used to check delivery status later

### Smart OTP Operations:

- **Send SMS OTP**: Requires recipient phone number and a `template_key` (mandatory for OTP)
- **Verify OTP**: The AI Agent automatically uses the `message_id` from recent OTP sending - no need to ask users for it again!
- Returns verification status (success/failure)

### Status Operations:

- **Check Status**: Requires a `message_id` from any previous send operation
- Returns detailed delivery status information

### AI Agent Integration:

When used with AI Agents, the node can:

- **Smart Context Handling**: Automatically remembers `message_id` from sent OTPs
- **Intelligent Verification**: Never asks users for `message_id` when it's already available in conversation
- Detect message type based on context (email vs SMS)
- Convert phone numbers to proper MSISDN format
- Ask for missing required parameters
- Track message delivery with the returned `message_id`

### Language support:

The node works with any language supported by the AI Agent (Thai, English, etc.).

---

## AI Agent Configuration

For optimal performance, configure your AI Agent with the following prompt structure:

### Recommended AI Agent Prompt:

```
You are a Taximail Communication Assistant, an AI agent specialized in helping users send emails, SMS, and manage OTP communications through the Taximail service.

## IMPORTANT: Context Memory Rules

- **ALWAYS remember information from the current conversation**
- **When you send an OTP, AUTOMATICALLY save the Message ID for verification**
- **If user provides an OTP code, use the MOST RECENT Message ID from the conversation**
- **DO NOT ask for Message ID again if it was already provided in this conversation**

## Smart OTP Verification Flow:

1. When sending OTP → Save Message ID automatically
2. When user provides OTP code → Use the saved Message ID immediately
3. Only ask for Message ID if no OTP was sent in this conversation

## Example Smart Flow:

User: "Send OTP to +66891234567"
You: _Send OTP_ → "OTP sent! Message ID: ABC123 saved for verification"
User: "The code is 1234"
You: _Verify immediately using ABC123_ → "Verifying code 1234..."

Remember: **NEVER ask for information you already have from the conversation context!**
```

### Memory Configuration:

Use **Simple Memory** node to store conversation context:

- **Memory Key**: `taximail_context`
- **Store**: Message IDs, phone numbers, and verification status
- **Auto-retrieve**: Recent OTP Message IDs for verification

### Example Conversation Flow:

**Smart Behavior (✅ Correct):**

```
User: "Send OTP to +66891234567"
Agent: [Sends OTP] "OTP sent successfully! Message ID: XYZ789 saved for verification"
User: "The OTP code is 5678"
Agent: [Auto-verifies with XYZ789] "Verifying code 5678 with saved Message ID..."
```

**Poor Behavior (❌ Avoid):**

```
User: "Send OTP to +66891234567"
Agent: [Sends OTP] "OTP sent successfully! Message ID: XYZ789"
User: "The OTP code is 5678"
Agent: "Please provide the Message ID to verify" ← Wrong! Should use XYZ789
```

---

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Taximail API Key Creation Guide](https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations)
- [Taximail Platform Documentation](https://www.taximail.com/en/support/using-taximail)
- [n8n AI Agent Documentation](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
