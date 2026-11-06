---
title: "Hardening AI-Generated Code: A Review Checklist for Enterprise Teams"
metaTitle: "Hardening AI-Generated Code: An Enterprise Checklist"
description: "A practical review checklist for hardening AI-generated code before it ships: secrets, dependencies, auth, data handling and the tests that prove it works."
date: 2026-10-18
author: Lucinda Bianchi
heroColor: "#000000"
heroTextColor: "#ffffff"
heroImage: /assets/pexels-jakubzerdzicki-37116245.webp
---

AI models have got dramatically better at writing code over the last two years, but they haven't got much better at writing secure code.

Veracode's 2026 GenAI Code Security Report found that roughly 44% of AI code generation tasks produced code with a known vulnerability, and the average security pass rate has barely moved since its first report. Models built specifically for coding did no better than general-purpose ones.

So hardening AI-generated code isn't something you can solve by picking a better model. It's a review discipline. This article gives you a checklist your engineers and reviewers can work through before AI-written code reaches production, ordered by where problems most often hide.

### Why AI-generated code needs its own review

The difficulty with AI-generated code is that it usually works. It compiles, the happy path runs, and it reads cleanly enough that a tired reviewer approves it. The weaknesses sit in the places a demo never touches: who is allowed to call an endpoint, what happens with malformed input, which package was actually installed.

The UK's National Cyber Security Centre made a useful point about this in June 2026. Its "vibe coding spectrum" guidance argues that different code deserves different levels of oversight. Fully AI-written code can be fine for prototypes, demos and internal tools with no sensitive data. Code that handles logins, credentials or personal data needs a person to review it, understand it and verify it does what it should.

**The useful question isn't whether AI wrote the code. It's what the code touches.** That gives you a simple way to decide how hard to look.

| Tier  | What the code touches  | Review level  |
| --- | --- | --- |
| 1  | Authentication, payments, personal or regulated data, infrastructure, cryptography  | Full checklist, named human reviewer, security sign-off  |
| 2  | Business logic, internal APIs, integrations with other systems  | Full checklist, standard peer review  |
| 3  | UI components, content, styling, throwaway prototypes  | Automated checks, light review  |

Most enterprise teams find that tier 1 is a small fraction of the codebase. Concentrating review effort there is what keeps AI speed intact everywhere else.

### The checklist

**Secrets and configuration**

AI tools are happy to put an API key straight into the file that needs it, and prototypes built in a hurry rarely clean up afterwards.

-   No keys, tokens or passwords anywhere in the code or config files, including the full git history and not only the latest commit.
    
-   Any secret that has ever been committed is treated as exposed and rotated.
    
-   Front-end bundles checked for keys that ship to the browser, a common slip in AI-built web apps.
    
-   Prototype environments confirmed as separate from production, with no live database credentials carried over.
    

**Dependencies**

This is the risk that's most specific to AI. Models suggest packages that don't exist, and attackers have noticed. A USENIX Security 2025 study found that about one in five packages recommended by the models it tested didn't exist, and 43% of those invented names came back every time the same prompt was rerun. That predictability is what makes "slopsquatting", registering a hallucinated name and filling it with malicious code, a workable attack.

-   Every new package confirmed as real, actively maintained and the one you meant, before it's installed.
    
-   Versions pinned and lockfiles committed.
    
-   Software composition analysis running on every build, covering known vulnerabilities and licences.
    
-   Unused dependencies removed. AI often imports things it never calls.
    

**Authentication and authorisation**

AI-built apps frequently hide a button from the wrong user and assume that's the same as stopping them.

-   Every endpoint checks permissions on the server, not just in the interface.
    
-   Object-level access tested. Changing an ID in a request shouldn't return someone else's record.
    
-   Login, session and password reset flows use your framework's tested components rather than hand-rolled logic.
    
-   Database access rules (including row-level security on backend-as-a-service databases common in AI app builders) actually enabled and tested.
    

**Input, output and data handling**

The classic injection flaws are still where AI code fails most visibly. In Veracode's 2026 testing, models failed to defend against cross-site scripting 85% of the time.

-   Database queries parameterised, with no string-built SQL.
    
-   Output encoded wherever user input is rendered.
    
-   Validation enforced on the server, whatever the front end does.
    
-   Logs checked so they don't capture personal data or let user input forge log entries.
    
-   Personal data limited to what the feature needs, with retention agreed.
    

**Business logic and failure states**

Models write for the scenario in the prompt. Real users find the others.

-   Edge cases covered: empty states, duplicates, concurrent edits, very large inputs.
    
-   Rate limits on anything that costs money or sends messages.
    
-   Error messages that help users without exposing stack traces, queries or file paths.
    

**Tests and proof**

-   Tests that define expected behaviour written or reviewed by a person, ideally before the AI implements against them.
    
-   Negative tests for tier 1 code, proving the wrong user is refused.
    
-   Static analysis running in the pipeline. One 2026 comparison found around 60% of confirmed vulnerabilities in AI-generated samples were caught by only one of the scanners it used, so a second tool is worth the noise.
    

**Maintainability and ownership**

Code nobody understands is a security problem on a delay.

-   New code follows your existing patterns and components rather than inventing parallel ones.
    
-   Duplicated and dead code removed.
    
-   Someone on the team can explain every tier 1 file without asking the AI what it does.
    

### Make most of the checklist automatic

A checklist that relies on memory gets skipped on a Friday afternoon. The more of it that runs in the pipeline, the more reviewer attention goes to the judgement calls.

Secret scanning as a pre-commit hook, dependency and static analysis on every pull request, and branch protection that requires a named reviewer for tier 1 paths will catch most of the mechanical problems. The NCSC's chief technology officer made a similar argument in March 2026: limit what code can do with fixed rules and controls, rather than expecting one AI to police another. AI review tools are a useful extra layer on top of that, not a replacement for it.

Prevention helps too. Coding agents work from whatever context you give them, so a project rules file that sets out your security standards, approved libraries and existing components changes what gets written in the first place. IOActive's April 2026 research found security-aware instructions and tooling improved results by up to 25 percentage points. That's a real gain, and still nowhere near enough to skip review.

### When the prototype already exists

Many teams reading this aren't starting fresh with [product prototyping](/discovery-prototyping). An innovation team has built something in Lovable, Replit or Claude Code, people like it, and now it needs to become a real product.

Resist the urge to rewrite it all. Map what the prototype touches first, sort each part into the tiers above and run the checklist on tier 1. The interface and user flows are often worth keeping, because that's where the validated thinking lives. The data layer, authentication and integrations are usually where rebuilding pays for itself. A short audit tells you which parts are which before anyone commits to a budget.

### Speed that survives contact with production

That 44% figure has held steady through two years of model releases, which tells you where the fix lives. It isn't in the next model. It's in knowing which code matters most and checking it properly every time.

If you've got an AI-built prototype that needs to become something your security team will sign off, [book a scoping call](/contact). We'll look at what's been built and show you which parts are worth keeping and which need hardening before it ships.
