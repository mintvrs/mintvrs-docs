import React, { useRef, useState, useEffect } from 'react';
import {
  useTabsContextValue,
  TabsProvider,
  sanitizeTabsChildren,
  useScrollPositionBlocker,
} from '@docusaurus/theme-common/internal';
import useIsBrowser from '@docusaurus/useIsBrowser';
import clsx from 'clsx';

type TabValue = { value: string; label?: string; attributes?: Record<string, unknown>; default?: boolean };

function TabList({ className, block, selectedValue, selectValue, tabValues }: any) {
  const tabRefs: HTMLElement[] = [];
  const { blockElementScrollPositionUntilNextRender } = useScrollPositionBlocker();
  const tabItemListContainerRef = useRef<HTMLUListElement>(null);
  const [showTabArrows, setShowTabArrows] = useState(false);

  useEffect(() => {
    const el = tabItemListContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        requestAnimationFrame(() => setShowTabArrows(entry.target.clientWidth < entry.target.scrollWidth));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTabChange = (event: any) => {
    const newTab = event.currentTarget as HTMLElement;
    const idx = tabRefs.indexOf(newTab);
    const val = tabValues[idx]?.value;
    if (val && val !== selectedValue) {
      blockElementScrollPositionUntilNextRender(newTab);
      selectValue(val);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
    let focus: HTMLElement | null = null;
    const idx = tabRefs.indexOf(event.currentTarget as HTMLElement);
    if (event.key === 'ArrowRight') focus = tabRefs[idx + 1] ?? tabRefs[0];
    if (event.key === 'ArrowLeft') focus = tabRefs[idx - 1] ?? tabRefs[tabRefs.length - 1];
    if (event.key === 'Enter') handleTabChange(event);
    focus?.focus();
  };

  return (
    <div className="tabs__container">
      <div className="openapi-tabs__api-container">
        {showTabArrows && <button className={clsx('openapi-tabs__arrow', 'left')} onClick={(e) => { e.preventDefault(); tabItemListContainerRef.current && (tabItemListContainerRef.current.scrollLeft -= 90); }} />}
        <ul ref={tabItemListContainerRef} role="tablist" aria-orientation="horizontal" className={clsx('openapi-tabs__api-list-container', 'tabs', { 'tabs--block': block }, className)}>
          {tabValues.map(({ value, label, attributes }: TabValue) => (
            <li key={value} role="tab" tabIndex={selectedValue === value ? 0 : -1} aria-selected={selectedValue === value}
              ref={(el) => el && tabRefs.push(el)} onKeyDown={handleKeydown} onFocus={handleTabChange} onClick={handleTabChange}
              {...(attributes as any)} className={clsx('tabs__item', 'openapi-tabs__api-item', (attributes as any)?.className, { active: selectedValue === value })}>
              {label ?? value}
            </li>
          ))}
        </ul>
        {showTabArrows && <button className={clsx('openapi-tabs__arrow', 'right')} onClick={(e) => { e.preventDefault(); tabItemListContainerRef.current && (tabItemListContainerRef.current.scrollLeft += 90); }} />}
      </div>
    </div>
  );
}

function TabContent({ lazy, children, selectedValue }: any) {
  const childTabs = (Array.isArray(children) ? children : [children]).filter(Boolean) as React.ReactElement[];
  if (lazy) {
    const sel = childTabs.find((t) => t.props.value === selectedValue);
    return sel ? React.cloneElement(sel, { className: 'margin-top--md' }) : null;
  }
  return <div className="margin-top--md">{childTabs.map((t, i) => React.cloneElement(t, { key: i }))}</div>;
}

function TabsComponent(props: any) {
  const contextValue = useTabsContextValue(props);
  return (
    <TabsProvider value={contextValue}>
      <div className="openapi-tabs__container">
        <TabList {...props} {...contextValue} />
        <TabContent {...props} {...contextValue} />
      </div>
    </TabsProvider>
  );
}

export default function ApiTabs(props: any): JSX.Element {
  const isBrowser = useIsBrowser();
  return <TabsComponent key={String(isBrowser)} {...props}>{sanitizeTabsChildren(props.children)}</TabsComponent>;
}
