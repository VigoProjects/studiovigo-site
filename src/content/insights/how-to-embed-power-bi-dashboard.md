---
title: How to Embed a Power BI Dashboard (And Make It Worth Looking At)
metaTitle: How to Embed a Power BI Dashboard
description: Embedding a Power BI dashboard is the easy part. Making it clear, usable, and genuinely useful takes design thinking. Here's how to do both properly.
date: 2026-05-13
author: John Beck
heroColor: "#FFFFFF"
heroTextColor: "#000000"
heroImage: /assets/oct-25/pexels-rdne-7947954-%281%29.webp
---

Most Power BI dashboards tell a story that nobody wants to read.

The data is there. The numbers are correct. But the experience of using the thing, the layout, the hierarchy, the way it sits inside a product or website, is an afterthought. Users skim past it, misread it, or quietly stop opening it altogether.

[Embedding Microsoft Power BI](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards) is technically straightforward. Getting it to feel like a native, well-designed part of your product is a different challenge entirely. This post covers both: the mechanics of embedding Power BI correctly, and the design decisions that separate dashboards people use from dashboards people tolerate.

## The Two Ways to Embed a Power BI Dashboard

Microsoft offers two main embedding routes, and choosing the right one matters before you touch a line of code.

**Embed for your organisation** is the simpler path. It uses Azure Active Directory authentication, meaning users need a Power BI account to view the report. If you're building an internal tool for colleagues who already have Microsoft 365 licences, this works cleanly and requires minimal setup. You generate a secure embed URL from Power BI Service, drop it into an iframe, and the report appears, authenticated automatically via the user's existing session.

**Embed for your customers** is a different proposition. Here, your application owns the authentication. You generate an embed token via the Power BI REST API using a service principal or master user account, pass that token to the client, and use the Power BI JavaScript SDK to render the report. This is the route for any public-facing product, client portal, or SaaS platform where users shouldn't need their own Power BI licence.

The JavaScript SDK is worth understanding properly. Rather than a static iframe, it gives you programmatic control: you can respond to user interactions, apply row-level security to filter data per user, switch between report pages, and even capture events like when a user applies a filter or clicks a visual. For anything beyond a basic internal embed, this is the approach that gives you real flexibility.

Row-level security deserves particular attention. If you're building a multi-tenant product and different users should see different slices of data, RLS configured in Power BI Desktop and passed through the embed token is how you enforce that cleanly. Getting this right early saves significant rework later.

## Why Most Embedded Dashboards Feel Wrong

Technically working and genuinely usable are not the same thing. The most common problems with embedded Power BI dashboards aren't bugs, they're design failures.

Dashboards built by data analysts are optimised for completeness. Every metric, every filter, every drill-through path the analyst thought might be useful ends up on screen. For the person who actually needs to make a decision at 9am on a Tuesday, this is noise. The thing they care about is buried somewhere in the third row of visuals, styled identically to seventeen other things they don't care about.

The second problem is context collapse. A Power BI report embedded inside a product without any thought given to how it integrates visually becomes an obvious foreign object, different fonts, mismatched colours, clunky transitions. Users notice this even if they can't articulate it. It erodes trust in the product and makes the data feel less credible.

The third is responsiveness. Power BI's default canvas is a fixed-width design tool. On a laptop it looks fine. On a tablet it starts to break. On a phone it's often unusable. If your users access this data outside a desktop browser, this needs deliberate attention.

## Designing a Power BI Dashboard That Actually Works

Good dashboard design isn't decoration. It's the structure that makes data legible and decisions faster. This is the same discipline that underpins our [UX and UI design](/uxui-design) work more broadly: removing friction, establishing clear hierarchy, and making complexity feel simple.

**Start with one question.** Before you open Power BI Desktop, define the single most important question this dashboard should answer. Everything else is supporting context. If you can't name the primary question, you'll end up with an overview that answers nothing in particular.

**Design the layout before you build the visuals.** Sketch the canvas on paper or in a wireframe tool. Where does the most important number live? What does the user need to see before they drill into detail? What should sit above the fold? These are information architecture decisions that are much harder to unpick once you've spent two days building reports. Our [discovery and prototyping](/discovery-prototyping) process applies just as naturally to data products as it does to consumer applications.

**Use visual hierarchy deliberately.** KPI cards at the top, trend context beneath them, supporting breakdowns below that. Size, colour, and weight should all reflect importance, not just differentiate. A large number in a KPI card should be large because it matters most, not because it happened to fill the space.

**Limit colour to meaning.** Power BI's default colour palette encourages over-use. Pick two or three colours with specific semantic roles: one for primary data, one for comparisons or secondary context, one for alerts or thresholds. Anything that isn't conveying meaning is adding clutter.

**Match your product's visual language.** Power BI's theme editor lets you define hex values, fonts, and visual formatting in a JSON theme file. This is not optional polish, it's the difference between a dashboard that feels like part of your product and one that feels bolted on. Pull your brand's typeface, your primary colour palette, and apply them consistently across every visual.

**Build for the screen your users actually use.** Power BI Desktop allows you to set custom canvas sizes. If your embed container is a fixed width at 1200px, build to that size. If your users are routinely on smaller screens, consider a separate mobile-optimised layout using Power BI's mobile formatting view.

## Controlling the Embed Experience

The JavaScript SDK gives you meaningful control over what users see and how they interact with the embedded report. Use it.

Hiding the navigation bar, filter pane, and page tabs is a one-line configuration change, but it dramatically changes how finished the experience feels. If your application already has its own navigation and filtering UI, showing Power BI's native chrome on top of it creates visual and functional redundancy. Strip it back and let your product's interface do the work.

If you want users to apply filters, consider building your own filter controls in your application and passing filter state through the SDK rather than exposing Power BI's native filter panel. This keeps the interaction model consistent and gives you full control over what filters are available to whom.

Bookmark states are another underused capability. They allow you to save and restore specific combinations of filters, page selections, and visual states, useful for things like pre-set views ("show me last quarter" vs "show me by region") that you want to surface as one-click options in your product's UI.

## Performance Is Part of the Experience

A dashboard that takes eight seconds to load on every page visit is a dashboard people will stop visiting. Power BI's performance varies considerably depending on how the underlying data model is built and where the data lives.

Import mode, where data is pulled into Power BI's in-memory engine on a scheduled refresh, is consistently the fastest option for rendering. DirectQuery, which hits the source database on demand, is more real-time but can be noticeably slower for complex reports. For most embedded use cases, import mode with a refresh schedule that matches your users' actual needs is the right trade-off.

If your data model is complex, a performance audit of the DAX measures and query folding behaviour in your data source is worth doing before you invest in the embed integration. A well-structured model renders in under two seconds. A poorly structured one drags regardless of how the embed is configured.

## When to Bring in a Design Partner

There's a point in most data product projects where the technical implementation is largely done but the experience still isn't right. The numbers are correct, the data refreshes cleanly, the embed works, but something about it feels unfinished. Users aren't adopting it the way you hoped.

That's usually the point where [product strategy](/product-strategy) and design thinking start to earn their keep. What data actually matters to this user at this moment? What does the right decision-making flow look like? How do we reduce the cognitive load without losing the analytical depth that makes the dashboard valuable?

These aren't questions with technical answers. They're design questions, and working through them with the rigour they deserve changes what gets built and how it performs.

If you're at that stage, or if you want to approach the project that way from the start, [book a discovery call with Vigo](/contact). We work with organisations building data products, internal tools, and complex digital platforms, and we'd be glad to help you figure out where the real problems are.
