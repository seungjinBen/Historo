import type { StoryNode } from "./types";

// 트리의 선택 단계 수(깊이) = 진행 점 개수
export function treeDepth(node: StoryNode): number {
  if (!node.choices || node.choices.length === 0) return 0;
  return 1 + Math.max(...node.choices.map((c) => treeDepth(c.node)));
}
