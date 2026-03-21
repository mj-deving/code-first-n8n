# Code-Mode Feature Hypothesis Framework

> A scientific decision tool for validating what to build next.
> Designed for a solo developer building ahead of users, where the goal is reputation and technical credibility — not gated revenue metrics.

**Philosophy:** This framework does NOT say "wait for users before building." It says "spend 30 minutes validating before spending 30 hours building." Building ahead is the strategy. Building the *right* ahead is the tactic.

---

## 1. Hypothesis Template

Every feature idea gets stated as a testable hypothesis before development begins. Fill in every bracket.

```
FEATURE HYPOTHESIS
==================
Feature:      [Name — what you'd call it in a changelog]
Statement:    If I build [FEATURE], then [WHO] will [MEASURABLE ACTION],
              because [UNDERLYING ASSUMPTION about their current pain].

Prediction:   Within [TIMEFRAME] of shipping, I expect to see [SPECIFIC SIGNAL]
              reaching [THRESHOLD NUMBER].

Falsifiable:  This hypothesis is WRONG if, after [TIMEFRAME], [FAILURE SIGNAL]
              remains below [MINIMUM THRESHOLD].

Assumptions:  1. [Technical assumption — can this be built?]
              2. [Market assumption — does the pain exist?]
              3. [Adoption assumption — will they find/try it?]

Effort:       [S/M/L/XL] — estimated dev time: [hours/days]
Confidence:   [1-10] — gut feeling before validation (the prior)
```

### What Makes It Falsifiable

A hypothesis is falsifiable when you can name the ABSENCE of a signal that would prove it wrong. Good: "If nobody asks about auto-registration in 60 days of the community post being live, the pain doesn't exist." Bad: "People will find this useful."

### Template Example (filled)

```
FEATURE HYPOTHESIS
==================
Feature:      Auto-register sibling tools (v1.5)
Statement:    If I build auto-register, then n8n AI agent builders will
              adopt Code-Mode faster, because manual tool configuration
              is the #1 friction point preventing first use.

Prediction:   Within 30 days of shipping, at least 3 community posts or
              GitHub issues will reference the auto-register feature.

Falsifiable:  This hypothesis is WRONG if, after 60 days, zero users
              mention configuration friction as a barrier.

Assumptions:  1. n8n's supplyData() API exposes sibling node metadata
              2. Users who try Code-Mode find config harder than the tool itself
              3. Users discover the update (npm, community, GitHub)

Effort:       M — estimated dev time: 2-3 days
Confidence:   6/10 — config IS friction, but unclear if it's the blocking friction
```

---

## 2. Validation Ladder

Four levels, ordered by effort. Move UP the ladder only when the current level doesn't give a clear signal.

### Level 1: Signal Mining (30 minutes)

Check existing data. No building required.

| Signal Source | What to Look For | Tool |
|---|---|---|
| npm downloads | Weekly trend, spikes after posts | `npm stat n8n-nodes-utcp-codemode` or npmjs.com |
| GitHub stars + issues | Star velocity, issue themes, feature requests | GitHub Insights |
| n8n community forum | Questions about token costs, tool sprawl, code execution | Search forum for keywords |
| Reddit r/n8n, r/langchain | Pain signals about agent costs, tool overhead | Reddit search |
| Competitor announcements | Anthropic PTC updates, LangGraph CodeAct changes | GitHub releases, blogs |
| HackerNews / dev.to | Articles about agent token costs, code execution patterns | Search |
| Stack Overflow | Questions about n8n tool sub-nodes, isolated-vm | Tag search |

**Decision rule:** If 3+ independent sources show the pain your feature solves, confidence goes up +2 points. If zero sources mention it, confidence goes down -2.

### Level 2: Lightweight Probes (2-4 hours)

Put something out and measure response. No code yet.

| Probe Type | How | Success Signal |
|---|---|---|
| Feature announcement post | "Considering building X for Code-Mode. Would this solve your problem?" on n8n forum / Reddit | 5+ substantive replies (not just "cool") |
| Twitter/X poll | "What's the biggest friction with AI agent tools?" with 4 options | 50+ votes, your feature's option wins |
| GitHub Discussion | Open a discussion: "RFC: Auto-registration of sibling tools" | 3+ comments with use cases |
| Landing page | Simple page describing the feature, measure clicks on "notify me" | 10+ signups |
| Direct outreach | DM 5 n8n community power users, ask about the pain point | 3/5 confirm the pain |

**Decision rule:** If a probe gets engagement above threshold, confidence +2. If crickets after 7 days, confidence -1 (not -2, because distribution is hard for solo devs).

### Level 3: Prototype Validation (1-2 days)

Build the minimum version. Ship it as experimental/beta.

| Approach | Scope | Success Signal |
|---|---|---|
| Feature flag | Build it but hide behind a flag, share with 3-5 beta users | 2+ beta users report value |
| Branch release | npm publish as `next` tag, announce to interested users | Downloads on `next` > 10 in a week |
| Minimal viable feature | Ship the 60% version that proves the concept | 1+ user builds on top of it |
| Screencast/demo | Record a 2-min video showing the feature working | Video gets shared or referenced |

**Decision rule:** If prototype users report "I would use this in production," confidence +3. If they say "interesting but I'd need X first," pivot. If no engagement, pause.

### Level 4: Full Ship + Measure (days-weeks)

Ship to npm, announce, measure for 30-60 days.

| Metric | Measurement | Success Threshold |
|---|---|---|
| Adoption | npm weekly downloads delta | +20% sustained over 4 weeks |
| Engagement | GitHub issues/PRs about this feature | 2+ in 60 days |
| Retention | Users who update to new version | >50% of existing install base |
| Community signal | Mentions, blog posts, workflow shares | 1+ organic mention |

**Decision rule:** If thresholds are met, feature is validated. If not, apply kill criteria (Section 6).

---

## 3. Decision Matrix

Two axes: **Hypothesis Confidence** (1-10, your current belief) and **Development Effort** (S/M/L/XL).

```
                    Development Effort
                 S (<1 day)  M (2-3 days)  L (1-2 weeks)  XL (1+ month)
              ┌───────────┬────────────┬──────────────┬──────────────┐
Confidence    │           │            │              │              │
 9-10  HIGH   │  BUILD    │  BUILD     │  BUILD       │  BUILD       │
              │  NOW      │  NOW       │  NOW         │  (plan first)│
              ├───────────┼────────────┼──────────────┼──────────────┤
 7-8  GOOD    │  BUILD    │  BUILD     │  VALIDATE    │  VALIDATE    │
              │  NOW      │  NOW       │  (Level 2)   │  (Level 2-3) │
              ├───────────┼────────────┼──────────────┼──────────────┤
 4-6  MEDIUM  │  BUILD    │  VALIDATE  │  VALIDATE    │  INVESTIGATE │
              │  AHEAD *  │  (Level 1) │  (Level 2)   │  (Level 2-3) │
              ├───────────┼────────────┼──────────────┼──────────────┤
 1-3  LOW     │  BUILD    │  INVESTI-  │  SKIP        │  SKIP        │
              │  AHEAD *  │  GATE      │  (for now)   │  (for now)   │
              └───────────┴────────────┴──────────────┴──────────────┘
```

**"BUILD AHEAD" zone (marked with *):** For small-effort features where confidence is medium or low, build anyway. This is where the build-ahead philosophy lives. The cost of being wrong is low (a day or less), and the learning value is high. Worst case: you built something that teaches you about the problem space. Best case: you're ahead of the market.

**Key insight:** The matrix is more permissive than a typical startup framework because the cost function is different. For revenue-driven products, wasted dev time = wasted money. For reputation-driven products, wasted dev time = learning + portfolio + credibility. The penalty for building something nobody uses is lower when your goal is demonstrating capability.

### How to Read the Matrix

1. Fill in the hypothesis template (Section 1)
2. Your Confidence score = the initial rating
3. Estimate effort honestly (include testing, docs, deployment)
4. Find your cell. Follow its instruction.
5. If the instruction is VALIDATE, go to the indicated Validation Ladder level
6. After validation, re-rate confidence and check the matrix again

---

## 4. Metrics That Matter

Organized by category. Every metric has a source you can actually check.

### 4A. Developer Adoption

| Metric | Source | How to Measure | Frequency |
|---|---|---|---|
| npm weekly downloads | npmjs.com package page | Read directly | Weekly |
| npm download trend | npm-stat.com | 4-week rolling average | Bi-weekly |
| GitHub repo stars | GitHub Insights | Count + velocity (stars/week) | Weekly |
| GitHub forks | GitHub | Forks = serious interest | Weekly |
| Unique cloners | GitHub Traffic (Settings > Traffic) | 14-day window | Bi-weekly |
| n8n community installs | n8n community nodes list | Check if listed, position | Monthly |
| Version update rate | npm version download split | % on latest vs. old | Monthly |

### 4B. Token/Cost Savings

| Metric | Source | How to Measure | Frequency |
|---|---|---|---|
| Token savings ratio | Benchmark workflows (WF8 vs WF9) | Re-run benchmarks on new features | Per release |
| Cost per workflow execution | OpenRouter billing | Compare traditional vs code-mode cost | Per release |
| LLM calls reduced | n8n execution logs | Count calls in code-mode vs traditional | Per release |
| Execution time delta | n8n execution timing | Wall-clock time comparison | Per release |

### 4C. Workflow Complexity

| Metric | Source | How to Measure | Frequency |
|---|---|---|---|
| Max tools per code-mode chain | Test workflows | Build increasingly complex chains, find breakpoints | Per release |
| MCP servers supported | Integration tests | Count of working MCP presets | Per release |
| Error rate at complexity N | Test runs | % of failures at 5, 10, 15 tool chains | Per release |
| Config time for new users | Self-test (time yourself) or beta user reports | Minutes from install to first execution | Per release |

### 4D. Community Engagement

| Metric | Source | How to Measure | Frequency |
|---|---|---|---|
| Forum post views | n8n community post analytics | View count on your posts | Weekly |
| Forum replies | n8n community | Count of substantive replies | Weekly |
| GitHub issues opened | GitHub | Count + categorize (bug/feature/question) | Weekly |
| GitHub discussions | GitHub Discussions tab | Threads started by others | Bi-weekly |
| Mentions by others | GitHub search, Google alerts | "[code-mode]" OR "n8n-nodes-utcp" | Monthly |
| Blog/article mentions | Google search, dev.to | Organic references | Monthly |
| Reddit mentions | r/n8n, r/langchain search | Posts/comments referencing the tool | Monthly |

### 4E. Reputation & Credibility

| Metric | Source | How to Measure | Frequency |
|---|---|---|---|
| Community forum trust level | n8n community profile | Level 0-4 progression | Monthly |
| Inbound questions/DMs | Forum, GitHub, email | Count of people reaching out for help | Monthly |
| Speaking/content invitations | Email, DMs | Podcast invites, guest post requests | Quarterly |
| Portfolio referral traffic | Analytics on portfolio site | Clicks from Code-Mode to portfolio | Monthly |
| Consulting leads | Email, LinkedIn | Inquiries mentioning Code-Mode | Quarterly |
| Contributions to n8n ecosystem | GitHub | PRs to n8n core, other community nodes | Quarterly |

---

## 5. Bayesian Update Protocol

### The Mental Model (no formulas needed)

Think of your confidence score (1-10) as a dial. Evidence turns the dial. Strong evidence turns it a lot. Weak evidence turns it a little. Contradictory evidence turns it the other way.

**Prior:** Your starting confidence before any validation. Based on technical intuition, competitive analysis, and domain knowledge. Write it down with your reasoning.

**Evidence:** Any signal from the Validation Ladder (Section 2). Each piece of evidence has a weight.

**Posterior:** Your updated confidence after incorporating evidence. This is what goes into the Decision Matrix.

### Evidence Weight Table

| Evidence Type | Confidence Shift | Example |
|---|---|---|
| **Strong positive** | +3 | User says "I need exactly this" unsolicited |
| **Moderate positive** | +2 | 3+ forum posts describe the pain your feature solves |
| **Weak positive** | +1 | Related feature is popular in a different ecosystem |
| **Neutral** | 0 | No signal either way after reasonable search |
| **Weak negative** | -1 | Feature exists elsewhere but has low adoption |
| **Moderate negative** | -2 | Direct outreach: 0/5 users confirm the pain |
| **Strong negative** | -3 | Competitor built it and deprecated it |

### Update Rules

1. **Cap at 10, floor at 1.** Confidence doesn't go above 10 or below 1.
2. **Diminishing returns.** The 3rd piece of moderate positive evidence shifts by +1, not +2. Don't let confirmation bias inflate confidence.
3. **Negative evidence weighs more at high confidence.** If you're at 8 and get a moderate negative, shift -3 (not -2). Overconfidence is the most expensive mistake.
4. **Time decay.** Evidence older than 90 days loses 1 point of weight. Markets change.
5. **Source independence matters.** 3 signals from the same source (e.g., 3 Reddit posts by the same person) count as 1 signal, not 3.

### Worked Example: Auto-Register Sibling Tools

```
PRIOR: 6/10
Reasoning: Config IS friction (experienced it myself). But unclear if it's the
           BLOCKING friction vs. "I don't know Code-Mode exists" being the
           real blocker.

EVIDENCE ROUND 1 (Signal Mining, 30 min):
  - n8n forum search "tool configuration": 12 posts about tool setup pain
    → Moderate positive (+2) → confidence: 8
  - BUT: none specifically about Code-Mode (it's new, low awareness)
    → Weak negative (-1) → confidence: 7
  - Competitor check: LangGraph CodeAct has auto-tool-detection
    → Weak positive (+1) → confidence: 8

POSTERIOR AFTER ROUND 1: 8/10
Decision Matrix lookup: Confidence 8, Effort M → BUILD NOW

EVIDENCE ROUND 2 (if we wanted more certainty):
  - Posted RFC on GitHub Discussions, 0 comments after 14 days
    → Moderate negative (-2), but at confidence 8 this weighs -3
    → confidence: 5
  - Direct outreach to 3 n8n builders: 2/3 say "I didn't even know
    Code-Mode existed, config isn't my problem — discovery is"
    → Strong negative (-3) → confidence: 2

POSTERIOR AFTER ROUND 2: 2/10
Decision Matrix lookup: Confidence 2, Effort M → INVESTIGATE
Conclusion: The hypothesis was wrong. The problem isn't config friction,
            it's discovery. Pivot to distribution before building features.
```

This example shows the framework working as designed — it can change your mind. The prior of 6 seemed reasonable. Round 1 bumped it. Round 2 crushed it. The framework saved 2-3 days of building something nobody would have found.

---

## 6. Kill Criteria

Four triggers for stopping work on a feature direction. Each distinguishes PAUSE (revisit later) from ABANDON (remove from roadmap).

### Trigger 1: Sunk Cost Threshold

| Condition | Action |
|---|---|
| Spent >2x estimated effort and feature is <50% complete | PAUSE. Reassess scope. Can you ship 30% as value? |
| Spent >3x estimated effort and feature is <50% complete | ABANDON. The technical complexity was underestimated. |
| Spent >2x effort but feature is >80% complete | FINISH. You're close. Sunk cost fallacy doesn't apply to 80% done. |

### Trigger 2: Signal Absence

| Condition | Action |
|---|---|
| 30 days post-ship, zero engagement | PAUSE. Problem might be distribution, not the feature. Try announcing again differently. |
| 60 days post-ship, zero engagement despite 2+ distribution attempts | ABANDON this feature. Move to next hypothesis. |
| 30 days post-ship, engagement but not on this feature | PIVOT. Users want something else. Listen to what they're actually doing. |

### Trigger 3: Competitive Preemption

| Condition | Action |
|---|---|
| Competitor announces similar feature in beta | ACCELERATE. Ship yours first. First-mover advantage is real. |
| Competitor ships and it's good | PAUSE. Evaluate: is yours differentiated? If yes, continue. If no, pivot. |
| Competitor ships and it becomes standard (e.g., Anthropic PTC native in n8n) | ABANDON this angle. Compete on something they can't do (local execution, any-LLM, cost). |
| Platform (n8n) builds it natively | ABANDON. You can't outship the platform. Pivot to complementary features. |

### Trigger 4: Technical Infeasibility

| Condition | Action |
|---|---|
| Core dependency blocks the feature (e.g., n8n API doesn't expose what you need) | PAUSE. File upstream issue. Monitor for API changes. |
| Workaround exists but is fragile/hacky | BUILD with workaround, but flag as tech debt. Re-evaluate when upstream changes. |
| Fundamental architecture conflict (e.g., isolated-vm can't do X) | ABANDON this approach. Can the goal be achieved differently? |

### The Pause vs. Abandon Decision

Ask these three questions:
1. **Has the world changed?** If the reason you started is still valid, PAUSE. If the landscape shifted, ABANDON.
2. **Would you start this today?** Ignore what you've built. If you'd start this feature fresh today with what you know now, PAUSE. If not, ABANDON.
3. **Is there a smaller version that delivers value?** If yes, PIVOT to the smaller version. If not, ABANDON.

---

## 7. Applied Framework: Five Candidate Features

### 7A. Auto-Register Sibling Tools (v1.5)

```
FEATURE HYPOTHESIS
==================
Feature:      Auto-register sibling tool sub-nodes
Statement:    If I build auto-registration, then n8n AI agent builders will
              adopt Code-Mode 2x faster, because manual JSON tool configuration
              is the primary friction preventing first use.

Prediction:   Within 30 days, 3+ users mention auto-register as the reason
              they tried/adopted Code-Mode.

Falsifiable:  WRONG if after 60 days of shipping, zero users cite config
              as a barrier (meaning the real barrier is elsewhere).

Assumptions:  1. n8n supplyData() provides access to sibling node metadata
              2. Config friction > discovery friction (unverified)
              3. Users who install Code-Mode attempt to configure it

Effort:       M (2-3 days)
Confidence:   6/10
```

**Validation recommendation:** Level 1 first. Search n8n forum for "tool configuration" pain. Check if any Code-Mode GitHub issues mention config difficulty. If signal exists, build. If not, pivot to distribution efforts.

**Matrix placement:** Confidence 6, Effort M = VALIDATE (Level 1)

**Initial prior reasoning:** Config is genuinely fiddly (experienced it), but Code-Mode has near-zero users, so the blocking problem is likely awareness, not config UX. The assumption that config is the bottleneck needs testing.

**Risk:** Building a great onramp for a road nobody knows about.

---

### 7B. Workflow-as-Tool Composition (v2.0)

```
FEATURE HYPOTHESIS
==================
Feature:      Let sandbox call n8n sub-workflows as callable functions
Statement:    If I build workflow composition, then advanced n8n builders will
              create reusable, composable AI pipelines, because no tool currently
              lets an AI agent treat an n8n workflow as a function call.

Prediction:   Within 60 days, 2+ users share composed workflows on the forum
              or create workflow templates using the feature.

Falsifiable:  WRONG if after 90 days, zero users attempt composition (meaning
              the abstraction isn't useful or the concept doesn't resonate).

Assumptions:  1. n8n's webhook/sub-workflow API can be called from isolated-vm
              2. Advanced builders want this level of abstraction
              3. The concept of "workflow as function" is communicable

Effort:       L (1-2 weeks)
Confidence:   7/10
```

**Validation recommendation:** Level 2. Post an RFC with a diagram showing what composed workflows would look like. Gauge if the concept resonates before building.

**Matrix placement:** Confidence 7, Effort L = VALIDATE (Level 2)

**Initial prior reasoning:** This is the strategic moat (n8n-native, competitors can't replicate). Council identified it as the vision play. High technical confidence (webhooks work), but uncertain if the concept translates to users who think in visual workflows, not function composition.

**Risk:** Over-engineering for power users who don't exist yet. Could be a "build it and they will come" trap.

---

### 7C. Cross-Platform Expansion (LangGraph, CrewAI)

```
FEATURE HYPOTHESIS
==================
Feature:      Port code-mode optimization to LangGraph and CrewAI
Statement:    If I build cross-platform support, then AI agent developers
              outside n8n will adopt code-mode, because the O(n^2) token
              compounding problem is universal across all agent frameworks.

Prediction:   Within 90 days, combined npm/pip downloads across platforms
              exceed n8n-only downloads by 3x.

Falsifiable:  WRONG if after 90 days, non-n8n adoption is <10% of total
              downloads (meaning the n8n integration is the value, not the
              optimization pattern).

Assumptions:  1. LangGraph/CrewAI don't ship native code-mode before us
              2. The UTCP abstraction ports cleanly to other frameworks
              3. Other ecosystems have the same pain point as n8n
              4. A solo dev can maintain 3+ platform integrations

Effort:       XL (1+ month for 2 platforms)
Confidence:   5/10
```

**Validation recommendation:** Level 1 + Level 2. Mine LangGraph/CrewAI communities for token cost complaints. Post "Would code-mode help you?" in their forums/discords. If strong signal, build LangGraph first (biggest community).

**Matrix placement:** Confidence 5, Effort XL = SKIP (for now)

**Initial prior reasoning:** The pain is real (Anthropic PTC, LangGraph CodeAct prove it), but a solo dev maintaining 3+ platform integrations is unsustainable. Also, LangGraph already has CodeAct. The competitive landscape is different outside n8n — inside n8n, you're the only one. Outside, you're competing with well-funded teams.

**Risk:** Spreading too thin. Losing first-mover advantage in n8n while chasing a larger but more competitive market.

---

### 7D. SaaS Hosted Sandbox

```
FEATURE HYPOTHESIS
==================
Feature:      Cloud-hosted code execution sandbox (no local isolated-vm)
Statement:    If I build a hosted sandbox, then non-technical n8n users will
              adopt Code-Mode, because installing native C++ addons (isolated-vm)
              is a barrier for cloud/managed n8n deployments.

Prediction:   Within 60 days, 10+ users sign up for the hosted service,
              and 3+ convert to paying.

Falsifiable:  WRONG if after 60 days, fewer than 5 signups (meaning local
              execution isn't actually a barrier, or the audience is too small).

Assumptions:  1. Significant % of n8n users are on cloud/managed instances
              2. isolated-vm installation is a real blocker (not just friction)
              3. Users will pay for hosted execution
              4. You can run a secure multi-tenant sandbox service

Effort:       XL (1+ month: infrastructure, security, billing, ops)
Confidence:   4/10
```

**Validation recommendation:** Level 2. Create a landing page describing the hosted service. Include pricing. Measure "notify me" signups. If <10 signups in 30 days, skip.

**Matrix placement:** Confidence 4, Effort XL = SKIP (for now)

**Initial prior reasoning:** This shifts from "build a tool" to "run a service" — fundamentally different business. Solo dev running multi-tenant sandboxes = ops burden. The revenue potential exists but requires a different skill set (security, billing, SLA). Low confidence because the user base isn't established yet.

**Risk:** Premature monetization. Running infrastructure before having users who want it. Operations burden for a solo dev.

---

### 7E. Code Library / Marketplace

```
FEATURE HYPOTHESIS
==================
Feature:      Curated library of reusable code-mode snippets/patterns
Statement:    If I build a code library, then AI agents will produce better
              code-mode outputs, because they'll have proven patterns to
              reference and reuse, reducing errors and improving reliability.

Prediction:   Within 30 days, 5+ users browse the library, and 2+ submit
              their own patterns.

Falsifiable:  WRONG if after 60 days, the library has zero external
              contributions and <50 page views (meaning users don't need
              pre-built patterns — they generate code fine on their own).

Assumptions:  1. AI models struggle with code-mode syntax without examples
              2. Users want curated patterns, not just documentation
              3. A marketplace can grow with near-zero user base

Effort:       M (2-3 days for initial library, ongoing curation)
Confidence:   5/10
```

**Validation recommendation:** Level 1 + build-ahead. Check: do AI models (Claude, GPT-4) actually struggle with code-mode syntax? Run 10 test prompts without examples vs. with examples. If error rate drops >50% with examples, the library has value. This is validatable without any users.

**Matrix placement:** Confidence 5, Effort M = VALIDATE (Level 1). But since it's also content (not just code), it doubles as marketing material. The build-ahead zone applies.

**Initial prior reasoning:** This is a low-risk, high-learning play. Creating the library forces you to codify best practices, which improves documentation, which aids adoption. Even if nobody uses the "marketplace," the patterns become part of your docs and README.

**Risk:** Low risk. Worst case, you have better documentation. Consider building this as enhanced docs rather than a separate "marketplace."

---

## 8. Quick Reference: Feature Ranking Summary

| Feature | Confidence | Effort | Matrix Result | Recommended Next Step |
|---|---|---|---|---|
| Code Library | 5 | M | BUILD AHEAD | Build as enhanced docs. Validate AI error rates first (30 min). |
| Auto-Register (v1.5) | 6 | M | VALIDATE L1 | Mine forum for config pain signals. Build if confirmed. |
| Workflow Composition (v2.0) | 7 | L | VALIDATE L2 | Post RFC with diagram. Gauge concept resonance. |
| Cross-Platform | 5 | XL | SKIP | Revisit after n8n user base is established. |
| SaaS Sandbox | 4 | XL | SKIP | Landing page test only if distribution succeeds first. |

**Recommended build order (if validations pass):**
1. Code Library (low effort, improves docs regardless, build-ahead eligible)
2. Auto-Register v1.5 (medium effort, solves onboarding IF config is the bottleneck)
3. Workflow Composition v2.0 (high effort, strategic moat, validate concept first)
4. Cross-Platform (defer — maintain first-mover in n8n before expanding)
5. SaaS Sandbox (defer — requires users, ops, and a different business model)

---

## Appendix: Cheat Sheet (One-Page Reference)

```
HYPOTHESIS: If I build [X], then [WHO] will [ACTION], because [ASSUMPTION].
            Wrong if [FAILURE SIGNAL] after [TIMEFRAME].

VALIDATE:   L1: Signal mine (30 min) → L2: Probe (2-4 hr) →
            L3: Prototype (1-2 days) → L4: Ship + measure (30-60 days)

DECIDE:     High confidence + any effort = BUILD
            Medium confidence + small effort = BUILD AHEAD
            Medium confidence + large effort = VALIDATE
            Low confidence + large effort = SKIP

UPDATE:     Strong signal = +/-3. Moderate = +/-2. Weak = +/-1.
            Negative evidence weighs more when you're confident.
            3 signals from 1 source = 1 signal.

KILL:       >2x effort at <50% done = PAUSE
            60 days, 0 engagement, 2+ launches = ABANDON
            Platform builds it natively = ABANDON
            Would you start this today? No = ABANDON
```
