"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import ItemsToolbar from "@/components/items/ItemsToolbar";
import ItemList from "@/components/items/ItemList";
import CreateItemDialog from "@/components/items/CreateItemDialog";
import { useItemList, useCreateItem } from "@/hooks/useItems";
import type { Category, CreateItemArgs } from "@/hooks/useItems";
import type { StockFilter } from "@/components/items/ItemsToolbar";

/**
 * 物品管理页 — /items
 *
 * ITEM-002: 物品列表 + 搜索筛选 + 创建弹窗
 * 搜索为前端 filter（Convex 不支持全文搜索）
 */
export default function ItemsPage(): React.ReactElement {
  const router = useRouter();

  // ── 服务端状态 ──
  const items = useItemList({ includeArchived: false });
  const createItem = useCreateItem();

  // ── 本地状态 ──
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "">("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // ── 前端筛选 ──
  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      // 名称搜索
      if (searchQuery.trim() && !item.name.includes(searchQuery.trim())) {
        return false;
      }

      // 分类筛选
      if (categoryFilter && item.category !== categoryFilter) {
        return false;
      }

      // 库存状态筛选
      if (stockFilter !== "all") {
        if (stockFilter === "out" && item.quantity !== 0) return false;
        if (stockFilter === "low" && !(item.quantity > 0 && item.quantity <= item.alertThreshold)) return false;
        if (stockFilter === "ok" && item.quantity <= item.alertThreshold) return false;
      }

      return true;
    });
  }, [items, searchQuery, categoryFilter, stockFilter]);

  // ── 事件处理 ──
  const handleItemClick = useCallback(
    (itemId: string) => {
      router.push(`/items/${itemId}`);
    },
    [router],
  );

  const handleCreateSubmit = useCallback(
    async (args: CreateItemArgs): Promise<void> => {
      await createItem(args);
    },
    [createItem],
  );

  // ── 加载态 ──
  if (items === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--hs-border)] border-t-[var(--hs-accent)] rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* 工具栏 */}
      <ItemsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        onAddClick={() => setIsCreateDialogOpen(true)}
        itemCount={filteredItems.length}
      />

      {/* 物品列表 */}
      <div className="mt-4">
        <ItemList items={filteredItems} onItemClick={handleItemClick} />
      </div>

      {/* 创建弹窗 */}
      <CreateItemDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
