"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { AppNavigationItem } from "@/types/super-panel";

export function MobileMenu({ navigation, onNavigate }: { navigation: AppNavigationItem[]; onNavigate: () => void }) {
  const [openParentId, setOpenParentId] = useState<string | null>(null);
  const tree = useMemo(() => buildNavigationTree(navigation), [navigation]);

  return (
    <div className="border-t border-cocoa/10 bg-white transition-colors dark:border-white/10 dark:bg-[#170011] lg:hidden">
      <nav className="container-shell grid gap-2 py-4">
        {tree.map((item) => (
          <div key={item.id} className="grid gap-1">
            {item.children.length ? (
              <>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold hover:bg-cream dark:text-white dark:hover:bg-white/10"
                  aria-expanded={openParentId === item.id}
                  onClick={() => setOpenParentId((value) => (value === item.id ? null : item.id))}
                >
                  {item.label}
                  <ChevronDown className={cn("transition", openParentId === item.id && "rotate-180")} size={17} />
                </button>
                <div
                  className={cn(
                    "ml-3 grid overflow-hidden border-l border-cocoa/15 pl-3 transition-all duration-200 dark:border-white/15",
                    openParentId === item.id ? "max-h-96 translate-y-0 gap-1 py-1 opacity-100" : "max-h-0 -translate-y-2 gap-0 py-0 opacity-0"
                  )}
                >
                  {item.children.map((child) => (
                    <MobileLink key={child.id} item={child} onNavigate={onNavigate} tabIndex={openParentId === item.id ? 0 : -1} />
                  ))}
                </div>
              </>
            ) : (
              <MobileLink item={item} onNavigate={onNavigate} />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

function MobileLink({
  item,
  onNavigate,
  tabIndex
}: {
  item: NavigationNode;
  onNavigate: () => void;
  tabIndex?: number;
}) {
  return (
    <Link
      href={item.href || "#"}
      target={item.opensNewTab ? "_blank" : undefined}
      rel={item.opensNewTab ? "noreferrer" : undefined}
      tabIndex={tabIndex}
      className="rounded-lg px-3 py-2.5 text-sm font-semibold text-muted hover:bg-cream hover:text-cocoa dark:text-pink-100/75 dark:hover:bg-white/10 dark:hover:text-pink-100"
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

type NavigationNode = AppNavigationItem & { children: NavigationNode[] };

function buildNavigationTree(items: AppNavigationItem[]): NavigationNode[] {
  const nodes = new Map<string, NavigationNode>();
  items
    .filter((item) => item.isActive)
    .forEach((item) => nodes.set(item.id, { ...item, children: [] }));

  const roots: NavigationNode[] = [];
  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sort = (a: NavigationNode, b: NavigationNode) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label);
  roots.sort(sort);
  roots.forEach((node) => node.children.sort(sort));
  return roots;
}
