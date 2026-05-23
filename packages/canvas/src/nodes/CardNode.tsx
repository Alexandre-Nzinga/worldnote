import { type Node, type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";

export type CardNodeData = {
  title: string;
  subtitle?: string;
  cardType?: "character" | "location";
};

export type CardFlowNode = Node<CardNodeData, "worldnoteCard">;

function CardNodeInner({ data }: NodeProps<CardFlowNode>) {
  if (data.cardType === "character") {
    return (
      <div className="w-[250px] overflow-hidden rounded-[20px] border-[5px] border-[#a6a6a6] bg-[#1a1b20] text-[#f5f5f7] shadow-[0_8px_28px_rgba(15,23,42,0.28)]">
        <div className="h-[170px] bg-[#303238]" />
        <div className="border-t border-[#24262c] px-4 py-3">
          <div className="text-[28px] font-semibold leading-tight text-[#f7f7f8]">
            {data.title}
          </div>
          <div className="text-[14px] leading-tight text-[#d8d8db]">
            {data.subtitle ?? "subtitle"}
          </div>
          <div className="mt-3 h-px w-full bg-[#34363c]" />
          <div className="h-[120px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-[230px] rounded-xl border border-[#d3d3d3] bg-white px-4 py-3 text-wn-mono-900 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
      <div className="text-sm font-semibold text-wn-mono-900">{data.title}</div>
      {data.subtitle ? (
        <div className="text-xs text-wn-mono-500">{data.subtitle}</div>
      ) : null}
    </div>
  );
}

export const CardNode = memo(CardNodeInner);
CardNode.displayName = "CardNode";

export const cardNodeDefaults = {
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
} as const;
