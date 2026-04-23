"use client";

import { useState, useCallback, useMemo } from "react";
import type { ReactElement } from "react";
import {
  useShoppingList,
  useAddShoppingItem,
  useRemoveShoppingItem,
  useCompletePurchase,
  useGenerateFromAlerts,
} from "@/hooks/useShoppingList";
import type { ShoppingListItemDoc } from "@/hooks/useShoppingList";
import { useItemList } from "@/hooks/useItems";
import type { Id } from "@/convex/_generated/dataModel";
import ShoppingListToolbar from "@/components/shopping/ShoppingListToolbar";
import ShoppingListByCategory from "@/components/shopping/ShoppingListByCategory";
import PurchaseSheet from "@/components/shopping/PurchaseSheet";
import AddShoppingItemDialog from "@/components/shopping/AddShoppingItemDialog";
import { useToast, ToastContainer } from "@/components/ui/Toast";

/**
 * ShoppingPage — 购物清单页
 *
 * SHOP-002: 购物清单 UI 层
 * - 清单按分类分组展示（food/daily/medicine/appliance/other）
 * - 一键生成：从预警自动生成
 * - 手动添加：关联物品库或临时物品
 * - 勾选后展开 PurchaseSheet 填写实际数量和价格
 * - trackExpiry 物品入库时强制填写保质期日期
 * - 支持批量入库
 *
 * 设计系统：
 * - 单列列表布局 max-w-2xl mx-auto
 * - 页面标题 text-xl font-bold（Outfit）
 * - 加载态：skeleton pulse
 */
export default function ShoppingPage(): ReactElement {
  // ── Hooks ──
  const shoppingItems = useShoppingList("pending");
  const allItems = useItemList({ includeArchived: false });
  const addShoppingItem = useAddShoppingItem();
  const removeShoppingItem = useRemoveShoppingItem();
  const completePurchase = useCompletePurchase();
  const generateFromAlerts = useGenerateFromAlerts();
  const { messages, toast, dismiss: dismissToast } = useToast();

  // ── Local State ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPurchaseSheet, setShowPurchaseSheet] = useState(false);

  // ── 计算 trackExpiry 物品的 ID 集合 ──
  const trackExpiryItemIds = useMemo(() => {
    if (!allItems) return new Set<string>();
    const ids = new Set<string>();
    for (const item of allItems) {
      if (item.trackExpiry) {
        ids.add(item._id as string);
      }
    }
    return ids;
  }, [allItems]);

  // ── 获取选中的购物清单项 ──
  const selectedItems: ShoppingListItemDoc[] = useMemo(() => {
    if (!shoppingItems) return [];
    return shoppingItems.filter((item) => selectedIds.has(item._id));
  }, [shoppingItems, selectedIds]);

  // ── 事件处理 ──
  const handleToggleSelect = useCallback((id: Id<"shoppingListItems">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleRemove = useCallback(
    async (id: Id<"shoppingListItems">) => {
      try {
        await removeShoppingItem(id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast("已从清单移除", "success");
      } catch {
        toast("删除失败，请重试", "error");
      }
    },
    [removeShoppingItem, toast],
  );

  const handleAddItem = useCallback(
    async (args: {
      itemId?: Id<"items">;
      tempItemName?: string;
      plannedQuantity: number;
    }) => {
      await addShoppingItem(args);
      toast("已添加到购物清单", "success");
    },
    [addShoppingItem, toast],
  );

  const handleCompletePurchase = useCallback(
    async (args: {
      id: Id<"shoppingListItems">;
      actualQuantity: number;
      price?: number;
      expiryDate?: number;
    }) => {
      await completePurchase(args);
    },
    [completePurchase],
  );

  const handleBatchPurchaseStart = useCallback(() => {
    if (selectedItems.length === 0) return;
    setShowPurchaseSheet(true);
  }, [selectedItems.length]);

  const handlePurchaseCancel = useCallback(() => {
    setShowPurchaseSheet(false);
  }, []);

  // PurchaseSheet 全部入库成功后的清理
  const handlePurchaseSuccess = useCallback(() => {
    setShowPurchaseSheet(false);
    setSelectedIds(new Set());
    toast("入库完成，库存已更新", "success");
  }, [toast]);

  return (
    <div className="py-6 max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--hs-text)" }}
        >
          🛒 购物清单
        </h1>
        {shoppingItems !== undefined && shoppingItems.length > 0 && (
          <p className="mt-1 text-sm text-[var(--hs-text-muted)]">
            {shoppingItems.length} 项待购买
            {selectedIds.size > 0 && `，已选 ${selectedIds.size} 项`}
          </p>
        )}
      </div>

      {/* 工具栏 */}
      <div className="mb-4">
        <ShoppingListToolbar
          onGenerateFromAlerts={generateFromAlerts}
          onOpenAddDialog={() => setIsAddDialogOpen(true)}
          hasSelectedItems={selectedIds.size > 0}
          onBatchPurchase={handleBatchPurchaseStart}
          onToast={toast}
        />
      </div>

      {/* 内容区 */}
      {shoppingItems === undefined ? (
        /* 加载态：skeleton */
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-[var(--hs-radius-component)] bg-[var(--hs-border)] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* 购物清单列表 */}
          <ShoppingListByCategory
            items={shoppingItems}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onRemove={handleRemove}
          />

          {/* 入库面板（选中后显示） */}
          {showPurchaseSheet && selectedItems.length > 0 && (
            <div className="mt-6">
              <PurchaseSheet
                selectedItems={selectedItems}
                trackExpiryItemIds={trackExpiryItemIds}
                onCompletePurchase={handleCompletePurchase}
                onCancel={handlePurchaseCancel}
                onSuccess={handlePurchaseSuccess}
              />
            </div>
          )}
        </>
      )}

      {/* 手动添加弹窗 */}
      <AddShoppingItemDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddItem}
      />

      {/* Toast 反馈 */}
      <ToastContainer messages={messages} onDismiss={dismissToast} />
    </div>
  );
}
