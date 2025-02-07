// import { useMemo } from 'react';
import type { FC, TeactNode } from '../../lib/teact/teact';
import React, { memo, useEffect, useRef } from '../../lib/teact/teact';

import type { LeftColumnContent } from '../../types';
import type { MenuItemContextAction } from './ListItem';

import { APP_NAME, DEBUG, IS_BETA } from '../../config';
import animateHorizontalScroll from '../../util/animateHorizontalScroll';
import buildClassName from '../../util/buildClassName';
import {
  IS_ANDROID,
  IS_ELECTRON,
  IS_IOS,
  IS_MAC_OS,
} from '../../util/windowEnvironment';

import useTopOverscroll from '../../hooks/scroll/useTopOverscroll';
// import useAppLayout from '../../hooks/useAppLayout';
import useFlag from '../../hooks/useFlag';
import useOldLang from '../../hooks/useOldLang';
import usePreviousDeprecated from '../../hooks/usePreviousDeprecated';
import { useFullscreenStatus } from '../../hooks/window/useFullscreen';
import useLeftHeaderButtonRtlForumTransition from '../left/main/hooks/useLeftHeaderButtonRtlForumTransition';

import LeftSideMenuItems from '../left/main/LeftSideMenuItems';
// import Button from './Button';
import DropdownMenu from './DropdownMenu';
import Tab from './Tab';

import './TabList.scss';

export type TabWithProperties = {
  id?: number;
  title: TeactNode;
  badgeCount?: number;
  isBlocked?: boolean;
  isBadgeActive?: boolean;
  contextActions?: MenuItemContextAction[];
};

type OwnProps = {
  tabs: readonly TabWithProperties[];
  activeTab: number;
  className?: string;
  tabClassName?: string;
  onSwitchTab: (index: number) => void;
  contextRootElementSelector?: string;
  content: LeftColumnContent;
  onReset: NoneToVoidFunction;
  shouldSkipTransition: boolean;
  shouldHideSearch: boolean;
  onSelectArchived: NoneToVoidFunction;
  onSelectContacts: NoneToVoidFunction;
  onSelectSettings: NoneToVoidFunction;
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
  shouldHideSearch,
  onSelectArchived,
  onSelectContacts,
  onSelectSettings,
}) => {
  // eslint-disable-next-line no-null/no-null
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveTab = usePreviousDeprecated(activeTab);
  // const hasMenu = content === LeftColumnContent.ChatList;
  // const { isMobile } = useAppLayout();
  const lang = useOldLang();
  const isFullscreen = useFullscreenStatus();
  const [isBotMenuOpen, markBotMenuOpen, unmarkBotMenuOpen] = useFlag();

  const versionString = IS_BETA
    ? `${APP_VERSION} Beta (${APP_REVISION})`
    : DEBUG
      ? APP_REVISION
      : APP_VERSION;

  const {
    shouldDisableDropdownMenuTransitionRef,
    handleDropdownMenuTransitionEnd,
  } = useLeftHeaderButtonRtlForumTransition(shouldHideSearch);

  useTopOverscroll(containerRef, undefined, undefined, true);

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

  // const MainButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
  //   return ({ onTrigger, isOpen }) => (
  //     <Button
  //       round
  //       ripple={hasMenu && !isMobile}
  //       size="smaller"
  //       color="translucent"
  //       className={isOpen ? 'active' : ''}
  //       // eslint-disable-next-line react/jsx-no-bind
  //       onClick={hasMenu ? onTrigger : () => onReset()}
  //       ariaLabel={
  //         hasMenu ? lang('AccDescrOpenMenu2') : 'Return to chat list'
  //       }
  //     >
  //       <div
  //         className={buildClassName(
  //           'animated-menu-icon',
  //           !hasMenu && 'state-back',
  //           shouldSkipTransition && 'no-animation',
  //         )}
  //       />
  //     </Button>
  //   );
  // }, [hasMenu, isMobile, lang, onReset, shouldSkipTransition]);

  return (
    <div
      className={buildClassName('TabList', 'no-scrollbar', className)}
      ref={containerRef}
      dir={lang.isRtl ? 'rtl' : undefined}
    >
      <DropdownMenu
        // trigger={MainButton}
        footer={`${APP_NAME} ${versionString}`}
        className={buildClassName(
          'main-menu',
          lang.isRtl && 'rtl',
          shouldHideSearch && lang.isRtl && 'right-aligned',
          shouldDisableDropdownMenuTransitionRef.current
            && lang.isRtl
            && 'disable-transition',
        )}
        forceOpen={isBotMenuOpen}
        positionX={shouldHideSearch && lang.isRtl ? 'right' : 'left'}
        transformOriginX={
          IS_ELECTRON && IS_MAC_OS && !isFullscreen ? 90 : undefined
        }
        onTransitionEnd={
          lang.isRtl ? handleDropdownMenuTransitionEnd : undefined
        }
      >
        <LeftSideMenuItems
          onSelectArchived={onSelectArchived}
          onSelectContacts={onSelectContacts}
          onSelectSettings={onSelectSettings}
          onBotMenuOpened={markBotMenuOpen}
          onBotMenuClosed={unmarkBotMenuOpen}
        />
      </DropdownMenu>
      {tabs.map((tab, i) => (
        <Tab
          key={tab.id}
          title={tab.title}
          isActive={i === activeTab}
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
