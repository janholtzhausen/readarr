import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions
} from '@floating-ui/react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { kinds, tooltipPositions } from 'Helpers/Props';
import { isMobile as isMobileUtil } from 'Utilities/browser';
import styles from './Tooltip.css';

function Tooltip({
  className,
  bodyClassName = styles.body,
  anchor,
  tooltip,
  kind = kinds.DEFAULT,
  position = tooltipPositions.TOP,
  canFlip = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);

  const { refs, context, floatingStyles } = useFloating({
    middleware: [
      arrow({
        element: arrowRef
      }),
      flip({
        crossAxis: canFlip,
        mainAxis: canFlip
      }),
      offset({ mainAxis: 10 }),
      shift()
    ],
    open: isOpen,
    placement: position,
    whileElementsMounted: autoUpdate,
    onOpenChange: setIsOpen
  });

  const click = useClick(context, {
    enabled: isMobileUtil()
  });
  const dismiss = useDismiss(context);
  const hover = useHover(context, {
    handleClose: safePolygon()
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    hover
  ]);

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className={className}
      >
        {anchor}
      </span>

      {
        isOpen ?
          <FloatingPortal id="portal-root">
            <div
              ref={refs.setFloating}
              className={styles.tooltipContainer}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              <FloatingArrow
                ref={arrowRef}
                context={context}
                fill="var(--popoverArrowBorderColor)"
              />
              <div className={classNames(styles.tooltip, styles[kind])}>
                <div className={bodyClassName}>{tooltip}</div>
              </div>
            </div>
          </FloatingPortal> :
          null
      }
    </>
  );
}

Tooltip.propTypes = {
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  anchor: PropTypes.node.isRequired,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  kind: PropTypes.oneOf([kinds.DEFAULT, kinds.INVERSE]),
  position: PropTypes.oneOf(tooltipPositions.all),
  canFlip: PropTypes.bool
};

export default Tooltip;
