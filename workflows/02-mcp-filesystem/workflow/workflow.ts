import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : WF10 - MCP Filesystem Code-Mode Test
// Nodes   : 4  |  Connections: 3
//
// NODE INDEX
// ----------
// WebhookTrigger            webhook                 [trigger]
// ClaudeViaOpenRouter       lmChatOpenRouter        [ai_languageModel]
// CodeModeTool              codeModeTool            [ai_tool]
// AiAgent                   agent
//
// ROUTING MAP
// -----------
// WebhookTrigger → AiAgent
//
// AI CONNECTIONS
// --------------
// AiAgent.uses({ ai_languageModel: ClaudeViaOpenRouter.output, ai_tool: [CodeModeTool.output] })
// </workflow-map>

@workflow({
    id: 'Ml4GL2HRJCSpCXtM',
    name: 'WF10 - MCP Filesystem Code-Mode Test',
    active: true,
    settings: {
        executionOrder: 'v1',
        callerPolicy: 'workflowsFromSameOwner',
    },
})
export class McpFilesystemWorkflow {

    @node({
        id: 'trigger',
        webhookId: 'mcp-fs-test-001',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 304],
    })
    WebhookTrigger = {
        httpMethod: 'POST',
        path: 'mcp-filesystem-test',
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        id: 'gemini',
        name: 'Claude via OpenRouter',
        type: '@n8n/n8n-nodes-langchain.lmChatOpenRouter',
        version: 1,
        position: [512, 512],
    })
    ClaudeViaOpenRouter = {
        model: 'anthropic/claude-sonnet-4',
        options: {
            temperature: 0.1,
        },
    };

    @node({
        id: 'codemode',
        name: 'Code-Mode Tool',
        type: 'n8n-nodes-utcp-codemode.codeModeTool',
        version: 1,
        position: [512, 704],
    })
    CodeModeTool = {
        toolSources:
            '[{"name": "fs", "call_template_type": "mcp", "config": {"mcpServers": {"filesystem": {"transport": "stdio", "command": "cmd.exe", "args": ["/c", "node", "C:\\\\Users\\\\User\\\\AppData\\\\Roaming\\\\npm\\\\node_modules\\\\@modelcontextprotocol\\\\server-filesystem\\\\dist\\\\index.js", "C:\\\\Users\\\\User\\\\mcp-test"]}}}}]',
        timeout: 60000,
    };

    @node({
        id: 'agent',
        name: 'AI Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 1.7,
        position: [304, 304],
    })
    AiAgent = {
        promptType: 'define',
        text: 'List all files in the allowed directory, then read the contents of each file. Return a JSON object with each filename as key and its contents as value.',
        options: {
            systemMessage:
                'You have access to execute_code_chain which runs TypeScript in a sandbox with filesystem tools. Write a SINGLE code block that does everything at once. Available functions: fs.filesystem_list_directory({path: "C:\\Users\\User\\mcp-test"}), fs.filesystem_read_text_file({path: "..."}). Chain all operations in one code block and use return to return the final result. Do NOT call the tool multiple times — write ONE code block that does all the work.',
            maxIterations: 15,
        },
    };

    @links()
    defineRouting() {
        this.WebhookTrigger.out(0).to(this.AiAgent.in(0));

        this.AiAgent.uses({
            ai_languageModel: this.ClaudeViaOpenRouter.output,
            ai_tool: [this.CodeModeTool.output],
        });
    }
}
