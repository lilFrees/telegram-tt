import type { FC, TeactNode } from '../../lib/teact/teact';
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
} from '../../lib/teact/teact';

import type { MenuItemContextAction } from './ListItem';

import {
  requestMutation,
} from '../../lib/fasterdom/fasterdom';
import buildClassName from '../../util/buildClassName';
import { MouseButton } from '../../util/windowEnvironment';
import renderText from '../common/helpers/renderText';

import useContextMenuHandlers from '../../hooks/useContextMenuHandlers';
import { useFastClick } from '../../hooks/useFastClick';
import useLastCallback from '../../hooks/useLastCallback';

import Icon from '../common/icons/Icon';
import Menu from './Menu';
import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';

import './Tab.scss';

type OwnProps = {
  className?: string;
  title: TeactNode;
  isActive?: boolean;
  isBlocked?: boolean;
  badgeCount?: number;
  isBadgeActive?: boolean;
  previousActiveTab?: number;
  onClick?: (arg: number) => void;
  clickArg?: number;
  contextActions?: MenuItemContextAction[];
  contextRootElementSelector?: string;
};

const classNames = {
  active: 'Tab--active',
  badgeActive: 'Tab__badge--active',
};

const Tab: FC<OwnProps> = ({
  className,
  title,
  isActive,
  isBlocked,
  badgeCount,
  isBadgeActive,
  previousActiveTab,
  onClick,
  clickArg,
  contextActions,
  contextRootElementSelector,
}) => {
  // eslint-disable-next-line no-null/no-null
  const tabRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Set initial active state
    if (isActive && previousActiveTab === undefined && tabRef.current) {
      tabRef.current!.classList.add(classNames.active);
    }
  }, [isActive, previousActiveTab]);

  useEffect(() => {
    if (!isActive || previousActiveTab === undefined) {
      return;
    }

    const tabEl = tabRef.current!;
    const prevTabEl = tabEl?.parentElement!.children[previousActiveTab];
    if (!prevTabEl) {
      // The number of tabs in the parent component has decreased. It is necessary to add the active tab class name.
      if (isActive && !tabEl.classList.contains(classNames.active)) {
        requestMutation(() => {
          tabEl.classList.add(classNames.active);
        });
      }
    }
  }, [isActive, previousActiveTab]);

  const {
    contextMenuAnchor,
    handleContextMenu,
    handleBeforeContextMenu,
    handleContextMenuClose,
    handleContextMenuHide,
    isContextMenuOpen,
  } = useContextMenuHandlers(tabRef, !contextActions);

  const { handleClick, handleMouseDown } = useFastClick(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (contextActions && (e.button === MouseButton.Secondary || !onClick)) {
        handleBeforeContextMenu(e);
      }

      if (e.type === 'mousedown' && e.button !== MouseButton.Main) {
        return;
      }

      onClick?.(clickArg!);
    },
  );

  const getTriggerElement = useLastCallback(() => tabRef.current);
  const getRootElement = useLastCallback(() => (contextRootElementSelector
    ? tabRef.current!.closest(contextRootElementSelector)
    : document.body));
  const getMenuElement = useLastCallback(() => document
    .querySelector('#portals')!
    .querySelector('.Tab-context-menu .bubble'));
  const getLayout = useLastCallback(() => ({ withPortal: true }));

  return (
    <div
      className={buildClassName(
        'Tab',
        onClick && 'Tab--interactive',
        className,
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      ref={tabRef}
    >
      <span className="Tab_inner">
        {Boolean(badgeCount) && (
          <span
            className={buildClassName(
              'badge',
              isBadgeActive && classNames.badgeActive,
            )}
          >
            {badgeCount}
          </span>
        )}
        <Icon name="folder-badge" className="Tab--icon" />
        {typeof title === 'string' ? renderText(title) : title}
        {isBlocked && <Icon name="lock-badge" className="blocked" />}
        <i className="platform" />
      </span>

      {contextActions && contextMenuAnchor !== undefined && (
        <Menu
          isOpen={isContextMenuOpen}
          anchor={contextMenuAnchor}
          getTriggerElement={getTriggerElement}
          getRootElement={getRootElement}
          getMenuElement={getMenuElement}
          getLayout={getLayout}
          className="Tab-context-menu"
          autoClose
          onClose={handleContextMenuClose}
          onCloseAnimationEnd={handleContextMenuHide}
          withPortal
        >
          {contextActions.map((action) => ('isSeparator' in action ? (
            <MenuSeparator key={action.key || 'separator'} />
          ) : (
            <MenuItem
              key={action.title}
              icon={action.icon}
              destructive={action.destructive}
              disabled={!action.handler}
              onClick={action.handler}
            >
              {action.title}
            </MenuItem>
          )))}
        </Menu>
      )}
    </div>
  );
};

export default Tab;
