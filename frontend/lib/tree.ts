import type { StoryNode } from "./types";

export function treeDepth(node: StoryNode): number {
  if (!node.choices || node.choices.length === 0) return 0;
  return 1 + Math.max(...node.choices.map((c) => treeDepth(c.node)));
}

const Q1 = ["A", "B", "C"];
const Q2 = ["1", "2", "3"];
const Q3 = ["α", "β", "γ"];

// path 인덱스 배열 → 백엔드 스토리라인 ID (예: [0,1,2] → "A-2-γ")
export function pathToStorylineId(path: number[]): string {
  return `${Q1[path[0]] ?? "A"}-${Q2[path[1]] ?? "1"}-${Q3[path[2]] ?? "α"}`;
}
