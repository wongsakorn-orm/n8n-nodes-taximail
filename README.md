# n8n-nodes-taximail

This is an n8n community node. It lets you use **Taximail** in your n8n AI Agent workflows as a Tool.

**Taximail** is a Thailand-based service for sending transactional emails and SMS. This node allows AI Agents to send messages via Taximail, verify OTP codes, and check message delivery status.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
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

You will need a **Taximail API Key** to use this node.

1. Sign up or log in at [https://www.taximail.com](https://www.taximail.com)
2. Follow this guide to create an API key:  
   [https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations](https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations)
3. Add the credentials in n8n using **HTTP Basic Auth**

---

## Compatibility

- Minimum n8n version: `1.45.0` (with AI Agent Tool support)
- Tested on: `1.45.0`, `1.46.0`
- No known incompatibilities

---

## Usage

This node is designed to be used with **AI Agents** in n8n.

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

### OTP Operations:

- **Send SMS OTP**: Requires recipient phone number and a `template_key` (mandatory for OTP)
- **Verify OTP**: Requires the `message_id` from the OTP sending response and the OTP code to verify
- Returns verification status (success/failure)

### Status Operations:

- **Check Status**: Requires a `message_id` from any previous send operation
- Returns detailed delivery status information

### AI Agent Integration:

When used with AI Agents, the node can:

- Detect message type based on context (email vs SMS)
- Convert phone numbers to proper MSISDN format
- Ask for missing required parameters
- Track message delivery with the returned `message_id`

### Language support:

The node works with any language supported by the AI Agent.

---

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Taximail API Key Creation Guide](https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations)
- [Taximail Platform Documentation](https://www.taximail.com/en/support/using-taximail)
