# n8n-nodes-taximail

This is an n8n community node. It lets you use **Taximail** in your n8n AI Agent workflows as a Tool.

**Taximail** is a Thailand-based service for sending transactional emails and SMS. This node allows AI Agents to send messages via Taximail with automatic content generation if no template is specified.

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

- **Send Email**: Send transactional emails via Taximail.
- **Send SMS**: Send SMS via Taximail (with `template_key` or generated message if missing).

---

## Credentials

You will need a **Taximail API Key** to use this node.

1. Sign up or log in at [https://www.taximail.com](https://www.taximail.com)
2. Follow this guide to create an API key:  
   [https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations](https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations)
3. Add the credentials in n8n using **HTTP Basic Auth** (API key as username, password can be blank or dummy).

---

## Compatibility

- Minimum n8n version: `1.45.0` (with AI Agent Tool support)
- Tested on: `1.45.0`, `1.46.0`
- No known incompatibilities

---

## Usage

This node is designed to be used with **AI Agents** in n8n.

### Prompt behavior:

- If the AI Agent is asked to notify a phone number (e.g., “Notify 089xxxxxxx”), it detects that as an SMS and automatically converts it to MSISDN format (`+6689xxxxxxx`).
- If the target is an email address, it sends via email automatically.
- If no `template_key` is provided:
  - For **SMS**: AI will generate short and concise content to minimize cost.
  - For **Email**: AI will generate full HTML content with subject and body.
- The message will not be sent until all required parameters are provided.
- If any field is missing, the agent will ask the user for clarification.

### Language support:

The node automatically responds in the same language as the user’s message.

---

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Taximail API Documentation](https://www.taximail.com/en/support/using-taximail/learn-about-api-integrations)

---

## Version history

- **v0.1.0** – Initial release with email and SMS AI Agent Tool support
