// import { useMemo } from 'react';
import type { FC, TeactNode } from '../../lib/teact/teact';
import React, {
  memo, useEffect,
  useRef,
} from '../../lib/teact/teact';

import type { LeftColumnContent } from '../../types';
import type { MenuItemContextAction } from './ListItem';

import animateHorizontalScroll from '../../util/animateHorizontalScroll';
import buildClassName from '../../util/buildClassName';
import {
  IS_ANDROID,
  IS_IOS,
} from '../../util/windowEnvironment';

import useAppLayout from '../../hooks/useAppLayout';
import useHorizontalScroll from '../../hooks/useHorizontalScroll';
// import useTopOverscroll from '../../hooks/scroll/useTopOverscroll';
// import useAppLayout from '../../hooks/useAppLayout';
// import useHorizontalScroll from '../../hooks/useHorizontalScroll';
import useOldLang from '../../hooks/useOldLang';
import usePreviousDeprecated from '../../hooks/usePreviousDeprecated';

// import Button from './Button';
import Tab from './Tab';

import './TabList.scss';

export type TabWithProperties = {
  id?: number;
  title: TeactNode;
  badgeCount?: number;
  isBlocked?: boolean;
  isBadgeActive?: boolean;
  contextActions?: MenuItemContextAction[];
  emoticon?: string;
};

type OwnProps = {
  tabs: readonly TabWithProperties[];
  activeTab: number;
  className?: string;
  tabClassName?: string;
  onSwitchTab: (index: number) => void;
  contextRootElementSelector?: string;
  content?: LeftColumnContent;
  onReset?: NoneToVoidFunction;
  shouldSkipTransition?: boolean;
  shouldHideSearch?: boolean;
  onSelectArchived?: NoneToVoidFunction;
  onSelectContacts?: NoneToVoidFunction;
  onSelectSettings?: NoneToVoidFunction;
};

const TAB_SCROLL_THRESHOLD_PX = 16;
// Should match duration from `--slide-transition` CSS variable
const SCROLL_DURATION = IS_IOS ? 450 : IS_ANDROID ? 400 : 300;

const TabList: FC<OwnProps> = ({
  tabs,
  activeTab,
  onSwitchTab,
  contextRootElementSelector,
  className,
  tabClassName,
  // content,
  // onReset,
  // shouldSkipTransition,
}) => {
  // eslint-disable-next-line no-null/no-null
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveTab = usePreviousDeprecated(activeTab);
  // const hasMenu = content === LeftColumnContent.ChatList;
  // const { isMobile } = useAppLayout();
  const lang = useOldLang();

  useHorizontalScroll(containerRef, undefined, true);

  // Scroll container to place active tab in the center
  useEffect(() => {
    const container = containerRef.current!;
    const { scrollWidth, offsetWidth, scrollLeft } = container;
    if (scrollWidth <= offsetWidth) {
      return;
    }

    const activeTabElement = container.childNodes[
      activeTab
    ] as HTMLElement | null;
    if (!activeTabElement) {
      return;
    }

    const {
      offsetLeft: activeTabOffsetLeft,
      offsetWidth: activeTabOffsetWidth,
    } = activeTabElement;
    const newLeft = activeTabOffsetLeft - offsetWidth / 2 + activeTabOffsetWidth / 2;

    // Prevent scrolling by only a couple of pixels, which doesn't look smooth
    if (Math.abs(newLeft - scrollLeft) < TAB_SCROLL_THRESHOLD_PX) {
      return;
    }

    animateHorizontalScroll(container, newLeft, SCROLL_DURATION);
  }, [activeTab]);

  const { isMobile } = useAppLayout();

  return (
    <div
      className={buildClassName('TabList', 'no-scrollbar', className, isMobile && 'mobile')}
      ref={containerRef}
      dir={lang.isRtl ? 'rtl' : undefined}
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab.id}
          title={tab.title}
          isActive={i === activeTab}
          icon={tab.emoticon}
          isBlocked={tab.isBlocked}
          badgeCount={tab.badgeCount}
          isBadgeActive={tab.isBadgeActive}
          previousActiveTab={previousActiveTab}
          onClick={onSwitchTab}
          clickArg={i}
          contextActions={tab.contextActions}
          contextRootElementSelector={contextRootElementSelector}
          className={tabClassName}
        />
      ))}
    </div>
  );
};

export default memo(TabList);
