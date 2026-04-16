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
  const containerRef = useRef<HTMLUListElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) requestAnimationFrame(() => setShowArrows(e.target.clientWidth < e.target.scrollWidth));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleChange = (event: any) => {
    const idx = tabRefs.indexOf(event.currentTarget);
    const val = tabValues[idx]?.value;
    if (val && val !== selectedValue) {
      blockElementScrollPositionUntilNextRender(event.currentTarget);
      selectValue(val);
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLElement>) => {
    const idx = tabRefs.indexOf(event.currentTarget as HTMLElement);
    if (event.key === 'ArrowRight') (tabRefs[idx + 1] ?? tabRefs[0])?.focus();
    if (event.key === 'ArrowLeft') (tabRefs[idx - 1] ?? tabRefs[tabRefs.length - 1])?.focus();
    if (event.key === 'Enter') handleChange(event);
  };

  return (
    <div>
      {showArrows && <button className={clsx('openapi-tabs__arrow', 'left')} onClick={(e) => { e.preventDefault(); containerRef.current && (containerRef.current.scrollLeft -= 90); }} />}
      <ul ref={containerRef} role="tablist" aria-orientation="horizontal" className={clsx('openapi-tabs__discriminator-list-container', 'tabs', { 'tabs--block': block }, className)}>
        {tabValues.map(({ value, label, attributes }: TabValue) => (
          <li key={value} role="tab" tabIndex={selectedValue === value ? 0 : -1} aria-selected={selectedValue === value}
            ref={(el) => el && tabRefs.push(el)} onKeyDown={handleKeydown} onFocus={handleChange} onClick={handleChange}
            {...(attributes as any)} className={clsx('tabs__item', 'openapi-tabs__discriminator-item', (attributes as any)?.className, { active: selectedValue === value })}>
            {label ?? value}
          </li>
        ))}
      </ul>
      {showArrows && <button className={clsx('openapi-tabs__arrow', 'right')} onClick={(e) => { e.preventDefault(); containerRef.current && (containerRef.current.scrollLeft += 90); }} />}
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

export default function DiscriminatorTabs(props: any): JSX.Element {
  const isBrowser = useIsBrowser();
  return <TabsComponent key={String(isBrowser)} {...props}>{sanitizeTabsChildren(props.children)}</TabsComponent>;
}
