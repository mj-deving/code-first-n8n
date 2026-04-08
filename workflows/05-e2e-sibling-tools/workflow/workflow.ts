import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : WF11 - E2E Sibling Tools Test
// Nodes   : 5  |  Connections: 4
//
// NODE INDEX
// ----------
// WebhookTrigger            webhook                 [trigger]
// ClaudeViaOpenRouter       lmChatOpenRouter        [ai_languageModel]
// CalculatorTool            toolCode                [ai_tool]
// CodeModeTool              codeModeTool            [ai_tool]
// E2EAgent                  agent
//
// ROUTING MAP
// -----------
// WebhookTrigger → E2EAgent
//
// AI CONNECTIONS
// --------------
// E2EAgent.uses({ ai_languageModel: ClaudeViaOpenRouter.output, ai_tool: [CodeModeTool.output] })
// CodeModeTool.uses({ ai_tool: [CalculatorTool.output] })
// </workflow-map>

@workflow({
    id: 'pxCt6Wv92qqUbznT',
    name: 'WF11 - E2E Sibling Tools Test',
    active: true,
    settings: {
        callerPolicy: 'workflowsFromSameOwner',
    },
})
export class E2ESiblingToolsWorkflow {

    @node({
        id: 'webhook',
        webhookId: 'e2e-sibling-test',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [0, 300],
    })
    WebhookTrigger = {
        path: 'e2e-sibling-test',
        httpMethod: 'POST',
        responseMode: 'lastNode',
    };

    @node({
        id: 'llm',
        name: 'Claude via OpenRouter',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenRouter',
        version: 1,
        position: [300, 520],
    })
    ClaudeViaOpenRouter = {
        model: 'anthropic/claude-sonnet-4',
        options: {
            temperature: 0.1,
        },
    };

    @node({
        id: 'calculator',
        name: 'Calculator Tool',
        type: '@n8n/n8n-nodes-langchain.toolCode',
        version: 1.3,
        position: [700, 520],
    })
    CalculatorTool = {
        name: 'calculator',
        description:
            'Adds two numbers a and b together. Input: JSON with a and b fields (numbers). Returns their sum.',
        language: 'javaScript',
        jsCode: 'const input = typeof query === "string" ? JSON.parse(query) : query; return JSON.stringify({ sum: (input.a || 0) + (input.b || 0) });',
        specifyInputSchema: true,
        schemaType: 'manual',
        inputSchema:
            '{"type": "object", "properties": {"a": {"type": "number", "description": "First number"}, "b": {"type": "number", "description": "Second number"}}, "required": ["a", "b"]}',
    };

    @node({
        id: 'codemode',
        name: 'Code-Mode Tool',
        type: 'n8n-nodes-utcp-codemode.codeModeTool',
        version: 1,
        position: [500, 520],
    })
    CodeModeTool = {
        autoRegisterSiblings: true,
        toolSources: '[]',
        timeout: 30000,
        memoryLimit: 128,
    };

    @node({
        id: 'agent',
        name: 'E2E Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 2.1,
        position: [300, 300],
    })
    E2EAgent = {
        text: '={{ $json.body.prompt }}',
        options: {
            systemMessage: `You are a test agent with ONE tool: execute_code_chain.
You MUST call this tool for ANY calculation request. Do NOT try to calculate yourself.
When you call execute_code_chain, provide a TypeScript code string.

The sandbox has sibling tools available. To add numbers, use:
const result = sibling.calculator({ a: 42, b: 58 });
return result;

IMPORTANT: You must call execute_code_chain tool with the code parameter. Do not respond without calling the tool first.`,
        },
        promptType: 'define',
    };

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.E2EAgent.in(0));

        this.E2EAgent.uses({
            ai_languageModel: this.ClaudeViaOpenRouter.output,
            ai_tool: [this.CodeModeTool.output],
        });

        this.CodeModeTool.uses({
            ai_tool: [this.CalculatorTool.output],
        });
    }
}
