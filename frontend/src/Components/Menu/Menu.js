import {
  autoUpdate,
  flip,
  FloatingPortal,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useId, useState } from 'react';
import { align } from 'Helpers/Props';
import styles from './Menu.css';

function Menu({
  className = styles.menu,
  children,
  alignMenu = align.LEFT,
  enforceMaxHeight = true
}) {
  const menuButtonId = useId();
  const [maxHeight, setMaxHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const updateMaxHeight = useCallback(() => {
    const menuButton = document.getElementById(menuButtonId);

    if (!menuButton) {
      setMaxHeight(0);
      return;
    }

    const { bottom } = menuButton.getBoundingClientRect();
    setMaxHeight(window.innerHeight - bottom);
  }, [menuButtonId]);

  const onMenuButtonPress = useCallback(() => {
    setIsMenuOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (enforceMaxHeight) {
      updateMaxHeight();
    }
  }, [enforceMaxHeight, updateMaxHeight]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const onWindowResize = () => updateMaxHeight();
    const onWindowScroll = () => {
      if (isMenuOpen) {
        updateMaxHeight();
      }
    };

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, { capture: true });

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('scroll', onWindowScroll, { capture: true });
    };
  }, [isMenuOpen, updateMaxHeight]);

  const { refs, context, floatingStyles } = useFloating({
    middleware: [
      flip({
        crossAxis: false,
        mainAxis: true
      }),
      shift()
    ],
    open: isMenuOpen,
    placement: alignMenu === align.LEFT ? 'bottom-start' : 'bottom-end',
    whileElementsMounted: autoUpdate,
    onOpenChange: setIsMenuOpen
  });

  const outsidePress = useCallback((event) => {
    const reference = refs.reference.current;

    if (reference && reference.contains(event.target)) {
      return false;
    }

    setTimeout(() => {
      setIsMenuOpen(false);
    }, 100);

    return true;
  }, [refs.reference]);

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: 'click',
    outsidePress
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss
  ]);

  const childrenArray = React.Children.toArray(children);
  const button = React.cloneElement(childrenArray[0], {
    onPress: onMenuButtonPress
  });

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        id={menuButtonId}
        className={className}
      >
        {button}
      </div>

      {
        isMenuOpen ?
          <FloatingPortal id="portal-root">
            {React.cloneElement(childrenArray[1], {
              forwardedRef: refs.setFloating,
              style: {
                maxHeight,
                ...floatingStyles
              },
              isOpen: isMenuOpen,
              ...getFloatingProps()
            })}
          </FloatingPortal> :
          null
      }
    </>
  );
}

Menu.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  alignMenu: PropTypes.oneOf([align.LEFT, align.RIGHT]),
  enforceMaxHeight: PropTypes.bool
};

export default Menu;
