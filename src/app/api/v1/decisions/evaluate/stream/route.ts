import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json() as Record<string, unknown>;
    console.log("Decision requested:", body);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: Record<string, unknown>) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify(event).replace(/\n/g, "###NEWLINE###")}\n\n`
            )
          );
        };

        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        try {
          // Stage 1: Pipeline started & Context
          sendEvent({ type: "pipeline_started" });
          await delay(500);
          sendEvent({ type: "context_building" });
          await delay(1000);
          sendEvent({ type: "context_ready" });
          await delay(500);

          // Stage 2: Agents Activate (4 parallel)
          sendEvent({ type: "agent_started", content: { agent: "risk", label: "Risk Analyst", icon: "shield", color: "text-error" } });
          sendEvent({ type: "agent_started", content: { agent: "growth", label: "Growth Planner", icon: "trending_up", color: "text-secondary" } });
          sendEvent({ type: "agent_started", content: { agent: "lifestyle", label: "Lifestyle Coach", icon: "auto_awesome", color: "text-emerald-400" } });
          sendEvent({ type: "agent_started", content: { agent: "tax", label: "Tax Strategist", icon: "account_balance", color: "text-blue-400" } });

          // Stage 3: Agents Complete (Staggered)
          await delay(1500);
          sendEvent({
            type: "agent_completed",
            content: {
              agent: "risk",
              label: "Risk Analyst",
              icon: "shield",
              color: "text-error",
              response: "This adds £200/month fixed cost. Your emergency fund will drop below 3 months if you move now.",
            },
          });

          await delay(1000);
          sendEvent({
            type: "agent_completed",
            content: {
              agent: "lifestyle",
              label: "Lifestyle Coach",
              icon: "auto_awesome",
              color: "text-emerald-400",
              response: "A nicer environment boosts well-being and productivity. Worth the premium if you work from home often.",
            },
          });

          await delay(800);
          sendEvent({
            type: "agent_completed",
            content: {
              agent: "growth",
              label: "Growth Planner",
              icon: "trending_up",
              color: "text-secondary",
              response: "That £200 difference could yield £32,000 over 10 years invested. Is the extra space worth that?",
            },
          });

          await delay(1200);
          sendEvent({
            type: "agent_completed",
            content: {
              agent: "tax",
              label: "Tax Strategist",
              icon: "account_balance",
              color: "text-blue-400",
              response: "If you work from home, you can claim proportion of rent as expenses. Check if the new location qualifies.",
            },
          });

          // Stage 4: Mentor
          await delay(1000);
          sendEvent({ type: "mentor_started" });
          await delay(2000);
          sendEvent({
            type: "mentor_completed",
            content: {
              response: {
                verdict: "WAIT 3 MONTHS",
                key_number: "-£200/month",
                action_steps: [
                  "Save £600 to buffer the increased fixed cost.",
                  "Track working from home days to offset tax.",
                  "Re-evaluate the rental market in the autumn.",
                ],
              },
            },
          });

          // Pipeline finished
          await delay(500);
          sendEvent({ type: "pipeline_completed" });

          controller.close();
        } catch (e) {
          console.error("Stream error", e);
          sendEvent({ type: "pipeline_error", content: "Simulation aborted." });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 400 });
  }
}
