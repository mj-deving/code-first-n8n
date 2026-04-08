import { workflow, node, links } from '@n8n-as-code/transformer';

// NOTE: workflow.json needs re-export from n8n to match the live workflow.
// The JSON was exported before the Haiku migration and still references
// claude-3.5-sonnet and the old Code-Mode Tool node.

// <workflow-map>
// Workflow : Dev Loop — Full Lifecycle
// Nodes   : 4  |  Connections: 3
//
// NODE INDEX
// ----------
// WebhookTrigger            webhook                 [trigger]
// HaikuViaOpenRouter        lmChatOpenAi            [ai_languageModel]
// N8nApiTool                toolCode                [ai_tool]
// AiAgent                   agent
//
// ROUTING MAP
// -----------
// WebhookTrigger → AiAgent
//
// AI CONNECTIONS
// --------------
// AiAgent.uses({ ai_languageModel: HaikuViaOpenRouter.output, ai_tool: [N8nApiTool.output] })
// </workflow-map>

@workflow({
    id: 'EBMbixqklugU5WtQ',
    name: 'Dev Loop — Full Lifecycle',
    active: false,
    settings: {
        executionOrder: 'v1',
    },
})
export class DevLoopWorkflow {

    @node({
        id: 'e0f84f02-755e-4c8c-9d67-f2e61a86342b',
        webhookId: '8f2f6218-9be7-4b75-8758-6c30cd22d31a',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [240, 300],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'dev-loop',
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        id: '8df3d95d-d130-4654-ad3f-b6384d82d7bc',
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
        id: 'a1b2c3d4-e5f6-4789-ab01-234567890abc',
        name: 'n8n API Tool',
        type: '@n8n/n8n-nodes-langchain.toolCode',
        version: 1.3,
        position: [460, 400],
    })
    N8nApiTool = {
        name: 'n8n_api',
        description:
            'Call the n8n REST API. Accepts method (GET/POST/PUT/DELETE), path (e.g. /api/v1/workflows), and optional body (JSON string for POST/PUT). Returns the API response as JSON string.',
        language: 'javaScript',
        jsCode: `const method = $fromAI('method', 'HTTP method: GET, POST, PUT, DELETE', 'string');
const path = $fromAI('path', 'API path e.g. /api/v1/workflows', 'string');
const body = $fromAI('body', 'Optional JSON body for POST/PUT requests', 'string');

const baseUrl = 'http://localhost:5678';
const apiKey = $env.N8N_API_KEY;

const opts = {
  method,
  url: baseUrl + path,
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': apiKey
  },
  json: true
};
if (body && (method === 'POST' || method === 'PUT')) {
  opts.body = JSON.parse(body);
}

const data = await this.helpers.httpRequest(opts);
return JSON.stringify(data, null, 2);`,
        specifyInputSchema: false,
    };

    @node({
        id: '8bb633b0-f823-4354-b27c-acdee83b4256',
        name: 'AI Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3.1,
        position: [680, 300],
    })
    AiAgent = {
        promptType: 'define',
        text: `={{ \`Task: \${$json.body?.task || $json.task || 'No task provided'}

Payload:
\${JSON.stringify($json.body || $json, null, 2)}\` }}`,
        options: {
            systemMessage: `You are the dev-loop orchestrator for n8n workflows.

You have one tool: n8n_api — it calls the n8n REST API directly.

## How to use n8n_api
- method: GET, POST, PUT, DELETE
- path: the API path (e.g., /api/v1/workflows)
- body: JSON string for POST/PUT (optional)

## n8n API Reference
- List workflows: GET /api/v1/workflows
- Create workflow: POST /api/v1/workflows (body: {name, nodes, connections, settings})
- Get workflow: GET /api/v1/workflows/{id}
- Activate: POST /api/v1/workflows/{id}/activate
- Execute: POST /api/v1/workflows/{id}/execute
- Get execution: GET /api/v1/executions/{id}?includeData=true

## Task
1. Create the requested workflow via the API
2. Activate it
3. If it has a webhook trigger, test it
4. Report: workflow ID, actions taken, test result, any blockers

Keep it simple. For a hello-world webhook, create a minimal 2-node workflow: Webhook + Respond to Webhook.`,
            maxIterations: 15,
        },
    };

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.AiAgent.in(0));

        this.AiAgent.uses({
            ai_languageModel: this.HaikuViaOpenRouter.output,
            ai_tool: [this.N8nApiTool.output],
        });
    }
}
