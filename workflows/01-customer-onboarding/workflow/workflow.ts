import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : WF9 - Benchmark Code-Mode (1 Tool)
// Nodes   : 4  |  Connections: 3
//
// NODE INDEX
// ----------
// WebhookTrigger            webhook                 [trigger]
// GeminiModel               lmChatGoogleGemini      [ai_languageModel]
// CodeModeTool              codeModeTool            [ai_tool]
// BenchmarkAgent            agent
//
// ROUTING MAP
// -----------
// WebhookTrigger → BenchmarkAgent
//
// AI CONNECTIONS
// --------------
// BenchmarkAgent.uses({ ai_languageModel: GeminiModel.output, ai_tool: [CodeModeTool.output] })
// </workflow-map>

@workflow({
    id: 'WVeyUVbK32wI6ZGQ',
    name: 'WF9 - Benchmark Code-Mode (1 Tool)',
    active: true,
    settings: {
        executionOrder: 'v1',
        callerPolicy: 'workflowsFromSameOwner',
    },
})
export class CustomerOnboardingWorkflow {

    @node({
        id: 'bb000001-0001-4001-a001-000000000001',
        webhookId: 'cc000001-0001-4001-a001-000000000001',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 300],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'benchmark-codemode',
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        id: 'bb000001-0001-4001-a001-000000000003',
        name: 'Gemini Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [300, 550],
    })
    GeminiModel = {
        modelName: 'models/gemini-2.0-flash',
        options: {
            temperature: 0.1,
        },
    };

    @node({
        id: 'bb000001-0001-4001-a001-000000000004',
        name: 'Code-Mode Tool',
        type: 'n8n-nodes-utcp-codemode.codeModeTool',
        version: 1,
        position: [500, 550],
    })
    CodeModeTool = {
        toolSources: '[]',
        timeout: 30000,
        memoryLimit: 128,
    };

    @node({
        id: 'bb000001-0001-4001-a001-000000000002',
        name: 'Benchmark Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3.1,
        position: [300, 300],
    })
    BenchmarkAgent = {
        promptType: 'define',
        text: `={{ "You MUST call the execute_code_chain tool with TypeScript code that processes this customer through a complete 5-step onboarding pipeline. The code must: 1) validate the email and extract domain 2) classify the company by domain/name 3) score customer into a tier (platinum/gold/silver/bronze) 4) generate a personalized onboarding message 5) format a final report with all data. Return the complete report as JSON. Customer data: " + JSON.stringify($json.body) }}`,
        options: {
            systemMessage:
                'You are a customer onboarding assistant. You have ONE tool: execute_code_chain. Write a single TypeScript code block that performs ALL 5 steps of customer enrichment (validate email, classify company, score tier, generate message, format report). Do NOT call the tool multiple times — write ALL logic in ONE code block.',
        },
    };

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.BenchmarkAgent.in(0));

        this.BenchmarkAgent.uses({
            ai_languageModel: this.GeminiModel.output,
            ai_tool: [this.CodeModeTool.output],
        });
    }
}
