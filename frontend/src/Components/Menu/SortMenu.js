import PropTypes from 'prop-types';
import React from 'react';
import Menu from 'Components/Menu/Menu';
import ToolbarMenuButton from 'Components/Menu/ToolbarMenuButton';
import { icons } from 'Helpers/Props';

function SortMenu({
  className,
  children,
  isDisabled = false,
  ...otherProps
}) {
  return (
    <Menu
      className={className}
      {...otherProps}
    >
      <ToolbarMenuButton
        iconName={icons.SORT}
        text="Sort"
        isDisabled={isDisabled}
      />
      {children}
    </Menu>
  );
}

SortMenu.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  isDisabled: PropTypes.bool
};

export default SortMenu;
