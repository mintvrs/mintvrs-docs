/**
 * Swizzled SchemaTabs — fixes Docusaurus 3.10.0 + docusaurus-theme-openapi-docs v4.7.1
 * incompatibility. The plugin calls useTabs(props) as a state creator, but in
 * Docusaurus 3.10.0 useTabs() is a context consumer. Fix: use useTabsContextValue(props)
 * and wrap with TabsProvider so TabItem can read context via useTabs().
 */
import React, { useRef, useState, useEffect, cloneElement } from 'react';
import {
  useTabsContextValue,
  TabsProvider,
  sanitizeTabsChildren,
  useScrollPositionBlocker,
} from '@docusaurus/theme-common/internal';
import useIsBrowser from '@docusaurus/useIsBrowser';
import clsx from 'clsx';
import flatten from 'lodash/flatten';

type TabValue = { value: string; label?: string; attributes?: Record<string, unknown>; default?: boolean };

function TabList({
  className,
  block,
  selectedValue,
  selectValue,
  tabValues,
}: {
  className?: string;
  block?: boolean;
  selectedValue: string;
  selectValue: (v: string) => void;
  tabValues: TabValue[];
}) {
  const tabRefs: HTMLElement[] = [];
  const { blockElementScrollPositionUntilNextRender } = useScrollPositionBlocker();
  const tabItemListContainerRef = useRef<HTMLUListElement>(null);
  const [showTabArrows, setShowTabArrows] = useState(false);

  useEffect(() => {
    const el = tabItemListContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        requestAnimationFrame(() => {
          setShowTabArrows(entry.target.clientWidth < entry.target.scrollWidth);
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = (event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    const newTab = event.currentTarget as HTMLElement;
    const newTabIndex = tabRefs.indexOf(newTab);
    const newTabValue = tabValues[newTabIndex]?.value;
    if (newTabValue && newTabValue !== selectedValue) {
      blockElementScrollPositionUntilNextRender(newTab);
      selectValue(newTabValue);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
    let focusElement: HTMLElement | null = null;
    switch (event.key) {
      case 'Enter': handleTabChange(event as any); break;
      case 'ArrowRight': focusElement = tabRefs[tabRefs.indexOf(event.currentTarget as HTMLElement) + 1] ?? tabRefs[0]; break;
      case 'ArrowLeft': focusElement = tabRefs[tabRefs.indexOf(event.currentTarget as HTMLElement) - 1] ?? tabRefs[tabRefs.length - 1]; break;
      default: break;
    }
    focusElement?.focus();
  };

  return (
    <div className="openapi-tabs__schema-tabs-container" style={{ marginBottom: '1rem' }}>
      {showTabArrows && <button className="openapi-tabs__arrow left" onClick={(e) => { e.preventDefault(); tabItemListContainerRef.current && (tabItemListContainerRef.current.scrollLeft -= 90); }} />}
      <ul
        ref={tabItemListContainerRef}
        role="tablist"
        aria-orientation="horizontal"
        className={clsx('openapi-tabs__schema-list-container', 'tabs', { 'tabs--block': block }, className)}
      >
        {tabValues.map(({ value, label, attributes }) => (
          <li
            key={value}
            role="tab"
            tabIndex={selectedValue === value ? 0 : -1}
            aria-selected={selectedValue === value}
            ref={(el) => el && tabRefs.push(el)}
            onKeyDown={handleKeydown}
            onFocus={handleTabChange as any}
            onClick={handleTabChange as any}
            {...(attributes as any)}
            className={clsx('tabs__item', 'openapi-tabs__schema-item', (attributes as any)?.className, { active: selectedValue === value })}
          >
            <span className="openapi-tabs__schema-label">{label ?? value}</span>
          </li>
        ))}
      </ul>
      {showTabArrows && <button className="openapi-tabs__arrow right" onClick={(e) => { e.preventDefault(); tabItemListContainerRef.current && (tabItemListContainerRef.current.scrollLeft += 90); }} />}
    </div>
  );
}

function TabContent({ lazy, children, selectedValue }: { lazy?: boolean; children: React.ReactNode; selectedValue: string }) {
  const childTabs = (Array.isArray(children) ? flatten(children as any[]) : [children]).filter(Boolean) as React.ReactElement[];
  if (lazy) {
    const selected = childTabs.find((t) => t.props.value === selectedValue);
    if (!selected) return null;
    return cloneElement(selected, { className: 'margin-top--md' });
  }
  return (
    <div className="margin-top--md">
      {childTabs.map((tabItem, i) => cloneElement(tabItem, { key: i }))}
    </div>
  );
}

function TabsComponent(props: any) {
  // FIX: use useTabsContextValue (state creator) instead of useTabs (context consumer)
  const contextValue = useTabsContextValue(props);
  return (
    // FIX: wrap with TabsProvider so Docusaurus TabItem can read selectedValue via useTabs()
    <TabsProvider value={contextValue}>
      <div className="openapi-tabs__schema-container">
        <TabList {...props} {...contextValue} />
        <TabContent {...props} {...contextValue} />
      </div>
    </TabsProvider>
  );
}

export default function SchemaTabs(props: any): JSX.Element {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent key={String(isBrowser)} {...props}>
      {sanitizeTabsChildren(props.children)}
    </TabsComponent>
  );
}
