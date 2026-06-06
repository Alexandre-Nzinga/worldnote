import { getBodyTextStyle, getHeadingProps } from "@worldnote/ui";
import { workflowSteps } from "@/components/landing/landingContent";
import { LANDING_ANCHORS } from "@/components/landing/landingAnchors";

export function WorkflowGuide() {
  return (
    <section
      id={LANDING_ANCHORS.workflow}
      className="mx-auto w-full max-w-[1008px] scroll-mt-24"
    >
      <div className="mb-10">
        <h2
          {...getHeadingProps("h2", {
            tone: "inverse",
            weight: "bold",
            className: "text-balance",
          })}
        >
          How it works
        </h2>
      </div>

      <ol className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
        {workflowSteps.map((step, index) => (
          <li
            key={step.number}
            className={[
              "relative flex flex-col gap-3",
              index < workflowSteps.length - 1
                ? "md:border-r md:border-wn-mono-700 md:pr-6"
                : "",
            ].join(" ")}
          >
            <span
              className="font-mono text-wn-mono-500"
              style={{
                fontSize: "13px",
                fontWeight: "var(--font-weight-wn-medium)",
              }}
            >
              {step.number}
            </span>
            <h3
              {...getHeadingProps("h4", {
                tone: "inverse",
                weight: "semibold",
                className: "text-balance",
              })}
            >
              {step.title}
            </h3>
            <p className="text-balance leading-relaxed" style={getBodyTextStyle("body")}>
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
