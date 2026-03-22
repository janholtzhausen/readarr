import {
  autoUpdate,
  flip,
  FloatingPortal,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react';
import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import Scroller from 'Components/Scroller/Scroller';
import { icons, scrollDirections, sizes } from 'Helpers/Props';
import { isMobile as isMobileUtil } from 'Utilities/browser';
import * as keyCodes from 'Utilities/Constants/keyCodes';
import HintedSelectInputOption from './HintedSelectInputOption';
import HintedSelectInputSelectedValue from './HintedSelectInputSelectedValue';
import TextInput from './TextInput';
import styles from './EnhancedSelectInput.css';

function isArrowKey(keyCode) {
  return keyCode === keyCodes.UP_ARROW || keyCode === keyCodes.DOWN_ARROW;
}

function getSelectedOption(selectedIndex, values) {
  return values[selectedIndex];
}

function findIndex(startingIndex, direction, values) {
  let indexToTest = startingIndex + direction;

  while (indexToTest !== startingIndex) {
    if (indexToTest < 0) {
      indexToTest = values.length - 1;
    } else if (indexToTest >= values.length) {
      indexToTest = 0;
    }

    if (getSelectedOption(indexToTest, values).isDisabled) {
      indexToTest += direction;
    } else {
      return indexToTest;
    }
  }

  return null;
}

function previousIndex(selectedIndex, values) {
  return findIndex(selectedIndex, -1, values);
}

function nextIndex(selectedIndex, values) {
  return findIndex(selectedIndex, 1, values);
}

function getSelectedIndex(value, values) {
  if (Array.isArray(value)) {
    return values.findIndex((v) => v.key === value[0]);
  }

  return values.findIndex((v) => v.key === value);
}

function isSelectedItem(index, value, values) {
  if (Array.isArray(value)) {
    return value.includes(values[index].key);
  }

  return values[index].key === value;
}

function normalizeMultiSelectValue(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null || value === '') {
    return [];
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => (/^\d+$/.test(item) ? Number(item) : item));
  }

  return [value];
}

function EnhancedSelectInput(props) {
  const {
    className = styles.enhancedSelect,
    disabledClassName = styles.isDisabled,
    name,
    value,
    values,
    isDisabled = false,
    isFetching,
    isEditable,
    isMultiSelect: isMultiSelectProp,
    hasError,
    hasWarning,
    valueOptions,
    selectedValueOptions,
    selectedValueComponent: SelectedValueComponent = HintedSelectInputSelectedValue,
    optionComponent: OptionComponent = HintedSelectInputOption,
    onChange,
    onOpen
  } = props;

  const selectValues = values ?? [];
  const normalizedValue = value ?? '';
  const isMultiSelect = isMultiSelectProp ?? Array.isArray(value);
  const multiSelectValue = isMultiSelect ? normalizeMultiSelectValue(value) : [];
  const [selectedIndex, setSelectedIndex] = useState(getSelectedIndex(normalizedValue, selectValues));
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMemo(() => isMobileUtil(), []);
  const selectedOption = getSelectedOption(selectedIndex, selectValues);
  const selectedOptionProps = selectedOption ? _.omit(selectedOption, 'value') : undefined;

  const { refs, context, floatingStyles } = useFloating({
    middleware: [
      flip({
        crossAxis: false,
        mainAxis: true
      }),
      size({
        apply({ availableHeight, elements, rects }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: `${Math.max(
              0,
              Math.min(window.innerHeight / 2, availableHeight)
            )}px`
          });
        }
      })
    ],
    open: isOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    onOpenChange: setIsOpen
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const selectedValue = useMemo(() => {
    if (selectValues.length) {
      return isMultiSelect ? multiSelectValue : normalizedValue;
    }

    if (isMultiSelect) {
      return [];
    } else if (typeof normalizedValue === 'number') {
      return 0;
    }

    return '';
  }, [isMultiSelect, multiSelectValue, normalizedValue, selectValues]);

  const onPress = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const onSelect = useCallback((newValue) => {
    const additionalProperties = selectValues.find((v) => v.key === newValue)?.additionalProperties;

    if (isMultiSelect) {
      const index = multiSelectValue.indexOf(newValue);

      if (index === -1) {
        const arrayValue = selectValues
          .map((v) => v.key)
          .filter((v) => v === newValue || multiSelectValue.includes(v));

        onChange({
          name,
          value: arrayValue,
          additionalProperties
        });
      } else {
        const arrayValue = [...multiSelectValue];
        arrayValue.splice(index, 1);

        onChange({
          name,
          value: arrayValue,
          additionalProperties
        });
      }
    } else {
      setIsOpen(false);
      onChange({
        name,
        value: newValue,
        additionalProperties
      });
    }
  }, [isMultiSelect, multiSelectValue, name, selectValues, onChange]);

  const onBlur = useCallback(() => {
    if (!isEditable) {
      const origIndex = getSelectedIndex(normalizedValue, selectValues);

      if (origIndex !== selectedIndex) {
        setSelectedIndex(origIndex);
      }
    }
  }, [normalizedValue, selectValues, isEditable, selectedIndex]);

  const onFocus = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  const onKeyDown = useCallback((event) => {
    const keyCode = event.keyCode;
    let nextIsOpen = null;
    let nextSelectedIndex = null;

    if (!isOpen) {
      if (!selectValues.length) {
        return;
      }

      if (isArrowKey(keyCode)) {
        event.preventDefault();
        nextIsOpen = true;
      }

      if (
        selectedIndex == null ||
        selectedIndex === -1 ||
        getSelectedOption(selectedIndex, selectValues)?.isDisabled
      ) {
        if (keyCode === keyCodes.UP_ARROW) {
          nextSelectedIndex = previousIndex(0, selectValues);
        } else if (keyCode === keyCodes.DOWN_ARROW) {
          nextSelectedIndex = nextIndex(selectValues.length - 1, selectValues);
        }
      }

      if (nextIsOpen !== null) {
        setIsOpen(nextIsOpen);
      }

      if (nextSelectedIndex !== null) {
        setSelectedIndex(nextSelectedIndex);
      }

      return;
    }

    if (keyCode === keyCodes.UP_ARROW) {
      event.preventDefault();
      nextSelectedIndex = previousIndex(selectedIndex, selectValues);
    }

    if (keyCode === keyCodes.DOWN_ARROW) {
      event.preventDefault();
      nextSelectedIndex = nextIndex(selectedIndex, selectValues);
    }

    if (keyCode === keyCodes.ENTER && selectedIndex != null && selectedIndex !== -1 && selectValues[selectedIndex]) {
      event.preventDefault();
      nextIsOpen = false;
      onSelect(selectValues[selectedIndex].key);
    }

    if (keyCode === keyCodes.TAB && selectedIndex != null && selectedIndex !== -1 && selectValues[selectedIndex]) {
      nextIsOpen = false;
      onSelect(selectValues[selectedIndex].key);
    }

    if (keyCode === keyCodes.ESCAPE) {
      event.preventDefault();
      event.stopPropagation();
      nextIsOpen = false;
      nextSelectedIndex = getSelectedIndex(normalizedValue, selectValues);
    }

    if (nextIsOpen !== null) {
      setIsOpen(nextIsOpen);
    }

    if (nextSelectedIndex !== null) {
      setSelectedIndex(nextSelectedIndex);
    }
  }, [normalizedValue, isOpen, selectedIndex, selectValues, onSelect]);

  const onOptionsModalClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onEditChange = useCallback((change) => {
    onChange(change);
  }, [onChange]);

  useEffect(() => {
    if (!Array.isArray(normalizedValue)) {
      setSelectedIndex(getSelectedIndex(normalizedValue, selectValues));
    }
  }, [normalizedValue, selectValues]);

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    }
  }, [isOpen, onOpen]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {
          isEditable && typeof value === 'string' ?
            <div className={styles.editableContainer}>
              <TextInput
                className={className}
                name={name}
                value={value}
                readOnly={isDisabled}
                hasError={hasError}
                hasWarning={hasWarning}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={onEditChange}
              />
              <Link
                className={classNames(
                  styles.dropdownArrowContainerEditable,
                  isDisabled ?
                    styles.dropdownArrowContainerDisabled :
                    styles.dropdownArrowContainer
                )}
                onPress={onPress}
              >
                {
                  isFetching ?
                    <LoadingIndicator className={styles.loading} size={20} /> :
                    <Icon name={icons.CARET_DOWN} />
                }
              </Link>
            </div> :
            <Link
              className={classNames(
                className,
                hasError && styles.hasError,
                hasWarning && styles.hasWarning,
                isDisabled && disabledClassName
              )}
              isDisabled={isDisabled}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              onPress={onPress}
            >
              <SelectedValueComponent
                values={selectValues}
                value={selectedValue}
                {...selectedValueOptions}
                isDisabled={isDisabled}
                isMultiSelect={isMultiSelect}
                {...selectedOptionProps}
              >
                {selectedOption ? selectedOption.value : selectedValue}
              </SelectedValueComponent>

              <div
                className={
                  isDisabled ?
                    styles.dropdownArrowContainerDisabled :
                    styles.dropdownArrowContainer
                }
              >
                {
                  isFetching ?
                    <LoadingIndicator className={styles.loading} size={20} /> :
                    <Icon name={icons.CARET_DOWN} />
                }
              </div>
            </Link>
        }
      </div>

      {
        !isMobile && isOpen ?
          <FloatingPortal id="portal-root">
            <Scroller
              registerScroller={refs.setFloating}
              className={classNames(styles.options, styles.optionsContainer)}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              {selectValues.map((v, index) => {
                const hasParent = v.parentKey !== undefined;
                const depth = hasParent ? 1 : 0;
                const parentSelected =
                  v.parentKey !== undefined &&
                  isMultiSelect &&
                  multiSelectValue.includes(v.parentKey);

                const { key, ...other } = v;

                return (
                  <OptionComponent
                    key={v.key}
                    id={v.key}
                    depth={depth}
                    isSelected={isSelectedItem(index, isMultiSelect ? multiSelectValue : normalizedValue, selectValues)}
                    isDisabled={parentSelected}
                    isMultiSelect={isMultiSelect}
                    {...valueOptions}
                    {...other}
                    isMobile={false}
                    onSelect={onSelect}
                  >
                    {v.value}
                  </OptionComponent>
                );
              })}
            </Scroller>
          </FloatingPortal> :
          null
      }

      {
        isMobile ?
          <Modal
            className={styles.optionsModal}
            size={sizes.EXTRA_SMALL}
            isOpen={isOpen}
            onModalClose={onOptionsModalClose}
          >
            <ModalBody
              className={styles.optionsModalBody}
              innerClassName={styles.optionsInnerModalBody}
              scrollDirection={scrollDirections.NONE}
            >
              <Scroller className={styles.optionsModalScroller}>
                <div className={styles.mobileCloseButtonContainer}>
                  <Link
                    className={styles.mobileCloseButton}
                    onPress={onOptionsModalClose}
                  >
                    <Icon name={icons.CLOSE} size={18} />
                  </Link>
                </div>

                {selectValues.map((v, index) => {
                  const hasParent = v.parentKey !== undefined;
                  const depth = hasParent ? 1 : 0;
                  const parentSelected =
                    v.parentKey !== undefined &&
                    isMultiSelect &&
                    multiSelectValue.includes(v.parentKey);

                  const { key, ...other } = v;

                  return (
                    <OptionComponent
                      key={key}
                      id={key}
                      depth={depth}
                      isSelected={isSelectedItem(index, isMultiSelect ? multiSelectValue : normalizedValue, selectValues)}
                      isMultiSelect={isMultiSelect}
                      isDisabled={parentSelected}
                      {...valueOptions}
                      {...other}
                      isMobile={true}
                      onSelect={onSelect}
                    >
                      {v.value}
                    </OptionComponent>
                  );
                })}
              </Scroller>
            </ModalBody>
          </Modal> :
          null
      }
    </>
  );
}

EnhancedSelectInput.propTypes = {
  className: PropTypes.string,
  disabledClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.any, PropTypes.array]),
  values: PropTypes.arrayOf(PropTypes.object),
  isDisabled: PropTypes.bool,
  isFetching: PropTypes.bool,
  isEditable: PropTypes.bool,
  isMultiSelect: PropTypes.bool,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  valueOptions: PropTypes.object,
  selectedValueOptions: PropTypes.object,
  selectedValueComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  optionComponent: PropTypes.elementType,
  onOpen: PropTypes.func,
  onChange: PropTypes.func.isRequired
};

export default EnhancedSelectInput;
