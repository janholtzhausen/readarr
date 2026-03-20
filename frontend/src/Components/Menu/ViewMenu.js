import PropTypes from 'prop-types';
import React from 'react';
import Menu from 'Components/Menu/Menu';
import ToolbarMenuButton from 'Components/Menu/ToolbarMenuButton';
import { icons } from 'Helpers/Props';

function ViewMenu({ children, isDisabled = false, ...otherProps }) {
  return (
    <Menu
      {...otherProps}
    >
      <ToolbarMenuButton
        iconName={icons.VIEW}
        text="View"
        isDisabled={isDisabled}
      />
      {children}
    </Menu>
  );
}

ViewMenu.propTypes = {
  children: PropTypes.node.isRequired,
  isDisabled: PropTypes.bool
};

export default ViewMenu;
