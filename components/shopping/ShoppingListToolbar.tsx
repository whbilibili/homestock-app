"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import Button from "@/components/ui/Button";

/**
 * ShoppingListToolbar — 购物清单工具栏
 *
 * 包含：一键生成按钮 + 手动添加按钮
 * 一键生成时显示 loading 态并反馈结果
 *
 * 设计系统：
 * - 水平排列，gap-2
 * - primary 按钮用于「一键生成」
 * - secondary 按钮用于「手动添加」
 */

interface ShoppingListToolbarProps {
  onGenerateFromAlerts: () => Promise<{ addedCount: number }>;
  onOpenAddDialog: () => void;
  hasSelectedItems: boolean;
  onBatchPurchase: () => void;
  /** 反馈消息回调 */
  onToast: (text: string, variant: "success" | "error" | "info") => void;
}

export default function ShoppingListToolbar({
  onGenerateFromAlerts,
  onOpenAddDialog,
  hasSelectedItems,
  onBatchPurchase,
  onToast,
}: ShoppingListToolbarProps): ReactElement {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (): Promise<void> => {
    setGenerating(true);
    try {
      const result = await onGenerateFromAlerts();
      if (result.addedCount > 0) {
        onToast(`已从预警生成 ${result.addedCount} 项购物清单`, "success");
      } else {
        onToast("暂无需要补购的物品，或已在清单中", "info");
      }
    } catch {
      onToast("生成失败，请重试", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="primary"
        size="md"
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? "生成中..." : "⚡ 一键生成"}
      </Button>
      <Button
        variant="secondary"
        size="md"
        onClick={onOpenAddDialog}
      >
        ➕ 手动添加
      </Button>
      {hasSelectedItems && (
        <Button
          variant="primary"
          size="md"
          onClick={onBatchPurchase}
          className="ml-auto"
        >
          📥 批量入库
        </Button>
      )}
    </div>
  );
}
