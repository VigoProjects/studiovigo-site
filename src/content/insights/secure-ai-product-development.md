---
title: Using AI in Product Development Without Exposing Your Data
description: "How enterprise teams use AI in product development without leaking code or customer data: the real risks, the controls that work and a practical setup."
date: 2026-10-18
author: Lucinda Bianchi
heroColor: "#000000"
heroTextColor: "#ffffff"
heroImage: /assets/pexels-mizunokozuki-12899156.jpg
---

In 2023, engineers at Samsung pasted proprietary source code into ChatGPT to help debug it. A few weeks later the company restricted generative AI tools on work devices. Three years on, most enterprises have swung from banning AI to wanting it in every part of delivery, but the question that worried Samsung hasn't gone away. How do you use AI in product development without your source code or customer data ending up somewhere you can't get it back from?

This guide is for product and engineering leads in organisations where that question carries real weight, whether that's a regulated sector or anywhere a security team has to sign off every new tool. By the end you'll know where exposure actually happens and which vendor terms are worth checking. You'll also have a setup that keeps the speed of AI without handing over control.

### The risk usually isn't the AI. It's the account

Most data leaks into AI tools don't come from a sanctioned platform failing. They come from people using the wrong version of the right tool.

A BlackFog survey of 2,000 UK and US employees at organisations with more than 500 staff, published in January 2026, found that nearly half had used AI tools their employer hadn't approved. A third had shared research or datasets with them, and more than a third admitted using the free version of a tool their company had already approved.

This last point is particularly important as the same product can sit under very different terms depending on which login is used. Anthropic's consumer plans can use chats and coding sessions for model training unless the user opts out, while its commercial plans (Team, Enterprise and the API) don't train on customer data by default. GitHub made a similar split in April 2026: interactions on Copilot Free and Pro are used for training unless the user opts out, while Business and Enterprise are excluded.

**The tool your developer uses at home and the one your security team approved can share a name and a logo while handling your code in completely different ways.** Blocking AI doesn't fix this either. It moves the same behaviour onto personal phones, where nobody can see it.

### Where code and data leak across the product lifecycle

It helps to walk through a normal delivery cycle and look at what actually gets shared at each stage, because the exposure points aren't always where people expect.

**Research and discovery**

User research produces some of the most sensitive material in any project: interview recordings, transcripts, support tickets and survey exports full of names and email addresses. Pasting a stack of transcripts into a chat window to pull out themes is one of the most useful things AI does, and one of the quickest ways to move personal data outside your control. Under UK GDPR that's a processing activity, and it needs a lawful basis and a processor agreement like any other.

**Design and prototyping**

Designers upload screenshots of internal dashboards to get layout ideas, often with real customer records still on screen. AI prototyping tools such as Lovable and Replit typically build and host the app on their own infrastructure, so a prototype wired up to a copy of production data is a copy of production data living on someone else's cloud. Innovation teams do this all the time, usually with good intentions and no idea it happened.

**Engineering**

Coding agents are where the stakes go up. A tool like Claude Code or Copilot's agent mode reads across your repository to understand context, which means it can read whatever is in there, including environment files and hard-coded keys someone meant to remove last year. The newer question isn't only what the vendor stores. It's what the agent is allowed to touch and run.

**The code itself**

Even with every data control in place, AI-generated code brings its own risk. Models will happily write SQL that's open to injection or skip an authorisation check on an endpoint. They also invent package names that don't exist, which attackers can later register. The speed that makes AI-assisted engineering attractive also means more unreviewed code reaches the main branch.

### What "enterprise-grade" AI terms actually mean

Vendors use "enterprise-grade" loosely. Four separate questions sit underneath that label, and a good answer to one doesn't imply a good answer to the others.

| Question  | What to look for  | Why it catches people out  |
| --- | --- | --- |
| Is our data used for training?  | A contractual no-training commitment on the plan you're actually buying  | Free and individual tiers of the same product often say yes  |
| How long are prompts and outputs kept?  | A stated retention period, and whether zero data retention (ZDR) is available  | ZDR is often limited to certain products, models or approved customers  |
| Where is it processed?  | Region pinning and residency terms  | Cross-region routing can move requests outside your chosen region  |
| What can the tool access and do?  | Admin controls over agent permissions, file access and command execution  | Agents act on your systems, so retention terms don't cover the risk  |

Retention is where the detail matters most. Anthropic's standard commercial retention is 30 days, and zero data retention is available on approval for its API and for Claude Code under Enterprise plans. But its own documentation is clear that the Claude Team and Enterprise chat interfaces aren't eligible for ZDR, and that some of its newest models require 30-day retention regardless. **Check ZDR per product and per model, not per vendor.**

Running models through your own cloud account changes the picture again. Amazon Bedrock, for example, states that it doesn't store or log prompts and completions, and that model providers have no access to the accounts the models run in. Its documentation also notes that cross-region inference can move prompts outside your source region, which matters if your residency commitments say UK only.

### Four ways to set up AI in product development for sensitive work

There's no single right setup. Most enterprises end up with a mix, matched to how sensitive each kind of work is.

1.  **Commercial plans with admin controls.** Team or Enterprise tiers of the mainstream tools, with SSO, central settings and no training on your data. Fine for most design, writing and research synthesis once personal data is stripped out.
    
2.  **Models through your own cloud account.** Amazon Bedrock, Google's Vertex AI or Microsoft Foundry, inside the agreements and regions you already have with that provider. Your security team has usually reviewed these contracts before, which shortens sign-off.
    
3.  **Zero data retention agreements for engineering.** Coding agents connected through commercial API keys with ZDR applied, so source code is processed and not stored.
    
4.  **Self-hosted open-weight models.** Models running in your own VPC or data centre, where nothing leaves your network. Maximum control, but less capable models and a platform you now have to run.
    

Picture an insurer modernising its claims platform. Research synthesis runs on a commercial plan with transcripts redacted first. Engineers use a coding agent on a ZDR agreement. Anything touching live claims data stays inside a model hosted in the insurer's own cloud. Nobody has to choose between AI and compliance, because the decision was made once, by data type, rather than argued again every sprint.

### Hardening the code AI writes

Data controls stop code leaking out. They do nothing about what AI puts in. That part is an engineering discipline, and it's usually the missing piece when an innovation team hands over an AI-built prototype.

The practices aren't new, they just matter more when code arrives faster. Secrets scanning before anything is committed. Dependency checks that catch packages nobody has heard of. Human review on anything handling authentication, payments or personal data. Tests written before the AI's code is trusted, not after. Agents kept well away from production credentials.

The most effective control is giving AI good examples to follow. A coding agent pointed at your approved patterns, your existing well-built components and your design tokens produces code that looks like your codebase. One left to guess produces code that looks like the internet.

### A practical setup for enterprise teams

If you're starting from a mix of banned tools and quiet workarounds, this is the order to tackle it in.

1.  **Classify what can go where.** Map your data types (public, internal, confidential, personal, regulated) to the setups above. One page your teams can actually use beats a forty-page policy nobody reads.
    
2.  **Give people a sanctioned tool that's genuinely good.** Shadow AI grows when the approved option is worse than the free one. If the official route is slower, people will route around it.
    
3.  **Put guardrails in the repository, not just the policy.** Ignore files that keep secrets out of an agent's context, pre-commit hooks, secret scanning and agent permission settings checked into the project.
    
4.  **Codify which tool is used at which stage.** AI tools are good at different things. One might be strong for early concepts, another for production code, and writing that down stops every project reinventing the process.
    
5.  **Keep people on the decisions that matter.** Architecture, security review and real conversations with users are where judgement lives. AI speeds up everything around them.
    

The ICO's [guidance on AI and data protection](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/) is worth reading alongside this, particularly if your AI use touches personal data and needs a DPIA.

### Speed without the exposure

Samsung's answer in 2023 was to ban the tools. Most enterprises can't afford that answer now, and they don't need it. The organisations getting real value from AI in product development haven't found a magic model. They've decided, deliberately and once, what goes where, and built that into how their teams work.

If you've got AI-built prototypes sitting with an innovation team, or you want AI in delivery without a fresh debate with your CISO every sprint, [book a scoping call](/contact). We'll look at what you've built and where your data needs to stay, then map what it takes to turn it into a product you can ship.
