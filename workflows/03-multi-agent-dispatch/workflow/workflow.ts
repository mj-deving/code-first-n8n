import { workflow, node, links } from '@n8n-as-code/transformer';

// NOTE: workflow.json needs export from n8n after push.

// <workflow-map>
// Workflow : Multi-Agent Dispatch (Code-Mode)
// Nodes   : 3  |  Connections: 2
//
// NODE INDEX
// ----------
// WebhookTrigger            webhook                 [trigger]
// HaikuViaOpenRouter        lmChatOpenAi            [ai_languageModel]
// AiAgent                   agent
//
// ROUTING MAP
// -----------
// WebhookTrigger -> AiAgent
//
// AI CONNECTIONS
// --------------
// AiAgent.uses({ ai_languageModel: HaikuViaOpenRouter.output })
// </workflow-map>

@workflow({
    id: 'gQ6JxL0mN2pR8sTv',
    name: 'Multi-Agent Dispatch (Code-Mode)',
    active: false,
    settings: {
        executionOrder: 'v1',
    },
})
export class MultiAgentDispatchWorkflow {

    @node({
        id: 'f1a2b3c4-d5e6-4f78-9012-abcdef123456',
        webhookId: 'a9b8c7d6-e5f4-4321-fedc-ba9876543210',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [240, 300],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'multi-agent-dispatch',
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        id: 'c3d4e5f6-a7b8-4c9d-0e1f-234567890abc',
        name: 'Haiku via OpenRouter',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
        version: 1,
        position: [460, 200],
    })
    HaikuViaOpenRouter = {
        model: 'anthropic/claude-haiku-4-5',
        options: {
            temperature: 0.1,
        },
    };

    @node({
        id: 'e5f6a7b8-c9d0-4e1f-2345-67890abcdef0',
        name: 'AI Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3.1,
        position: [680, 300],
    })
    AiAgent = {
        promptType: 'define',
        text: `={{ \`Customer request:\n\${JSON.stringify($json.body || $json, null, 2)}\` }}`,
        options: {
            systemMessage: `You are a multi-agent support dispatcher. Handle each customer request in one pass.

## Step 1: Classify
Determine the category: tech, sales, faq, or general.

## Step 2: Respond as the right specialist
Use domain-specific behavior based on the category:
- tech: provide troubleshooting steps, system requirements, compatibility notes, or operational guidance
- sales: provide pricing, plan guidance, upgrade paths, or ROI-oriented answers
- faq: answer clearly using common product knowledge and setup guidance
- general: provide a helpful general response when the request does not cleanly fit another category

## Step 3: Quality check
Before responding, verify:
- the response directly answers the request
- the tone is professional and helpful
- urgent is true if the message mentions words like down, broken, outage, urgent, emergency, or production impact

## Output rules
- Return valid JSON only
- Do not wrap the JSON in markdown fences
- confidence must be a number between 0 and 1

Use this schema:
{
  "category": "tech|sales|faq|general",
  "urgent": true,
  "response": "specialist response",
  "confidence": 0.0
}`,
            maxIterations: 1,
        },
    };

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.AiAgent.in(0));

        this.AiAgent.uses({
            ai_languageModel: this.HaikuViaOpenRouter.output,
        });
    }
}
