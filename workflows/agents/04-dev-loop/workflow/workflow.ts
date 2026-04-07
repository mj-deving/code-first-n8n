import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Dev Loop — Full Lifecycle
// Nodes   : 0  |  Connections: 0
//
// NODE INDEX
// ----------
// {{NodeName}}        {{node-type}}           [trigger]
// {{NodeName}}        {{node-type}}
//
// ROUTING MAP
// -----------
// {{Trigger}} → {{Step1}} → {{Step2}} → {{Output}}
//
// AI CONNECTIONS
// --------------
// {{AgentNode}}.uses({ ai_languageModel: {{LLMNode}}.output })
// </workflow-map>

@workflow({
    id: 'TODO',
    name: 'Dev Loop — Full Lifecycle',
    active: false,
    settings: {
        executionOrder: 'v1',
    },
})
export class DevLoopWorkflow {

    // --- Nodes ---

    // @node({
    //     id: '{{uuid}}',
    //     name: '{{Node Name}}',
    //     type: '{{n8n-node-type}}',
    //     version: 1,
    //     position: [0, 300],
    // })
    // NodeName = {
    //     // node parameters
    // };

    // --- Routing ---

    @links()
    defineRouting() {
        // this.Trigger.out(0).to(this.NextNode.in(0));
    }
}
