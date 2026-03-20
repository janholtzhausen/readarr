import { autoUpdate, flip, size, useFloating } from '@floating-ui/react-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import Autosuggest from 'react-autosuggest';
import styles from './AutoSuggestInput.css';

function AutoSuggestInput(props) {
  const {
    forwardedRef,
    className = styles.input,
    inputContainerClassName = styles.inputContainer,
    name,
    value = '',
    placeholder,
    suggestions,
    hasError,
    hasWarning,
    enforceMaxHeight = true,
    maxHeight = 200,
    getSuggestionValue,
    renderSuggestion,
    renderInputComponent,
    onInputChange,
    onInputKeyDown,
    onInputFocus,
    onInputBlur,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    onSuggestionSelected,
    onChange,
    ...otherProps
  } = props;

  const { refs, floatingStyles } = useFloating({
    middleware: [
      flip({
        crossAxis: false,
        mainAxis: true
      }),
      size({
        apply({ availableHeight, elements, rects }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: `${Math.max(0, availableHeight)}px`
          });
        }
      })
    ],
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate
  });

  const createRenderInputComponent = useCallback((inputProps) => {
    if (renderInputComponent) {
      return renderInputComponent(inputProps, refs.setReference);
    }

    return (
      <div ref={refs.setReference}>
        <input {...inputProps} />
      </div>
    );
  }, [refs.setReference, renderInputComponent]);

  const renderSuggestionsContainer = useCallback(({ containerProps, children }) => {
    return (
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className={children ? styles.suggestionsContainerOpen : undefined}
      >
        <div
          {...containerProps}
          style={{
            maxHeight: enforceMaxHeight ? maxHeight : undefined
          }}
        >
          {children}
        </div>
      </div>
    );
  }, [enforceMaxHeight, floatingStyles, maxHeight, refs.setFloating]);

  const handleInputKeyDown = useCallback((event) => {
    if (
      event.key === 'Tab' &&
      suggestions.length &&
      suggestions[0] !== value
    ) {
      event.preventDefault();

      if (value) {
        onSuggestionSelected?.(event, {
          suggestion: suggestions[0],
          suggestionValue: value,
          suggestionIndex: 0,
          sectionIndex: null,
          method: 'enter'
        });
      }
    }
  }, [value, suggestions, onSuggestionSelected]);

  const inputProps = {
    className: classNames(
      className,
      hasError && styles.hasError,
      hasWarning && styles.hasWarning
    ),
    name,
    value,
    placeholder,
    autoComplete: 'off',
    spellCheck: false,
    onChange: onInputChange,
    onKeyDown: onInputKeyDown || handleInputKeyDown,
    onFocus: onInputFocus,
    onBlur: onInputBlur
  };

  const theme = {
    container: inputContainerClassName,
    containerOpen: styles.suggestionsContainerOpen,
    suggestionsContainer: styles.suggestionsContainer,
    suggestionsList: styles.suggestionsList,
    suggestion: styles.suggestion,
    suggestionHighlighted: styles.suggestionHighlighted
  };

  return (
    <Autosuggest
      {...otherProps}
      ref={forwardedRef}
      id={name}
      inputProps={inputProps}
      theme={theme}
      suggestions={suggestions}
      getSuggestionValue={getSuggestionValue}
      renderInputComponent={createRenderInputComponent}
      renderSuggestionsContainer={renderSuggestionsContainer}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
    />
  );
}

AutoSuggestInput.propTypes = {
  forwardedRef: PropTypes.func,
  className: PropTypes.string,
  inputContainerClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  placeholder: PropTypes.string,
  suggestions: PropTypes.array.isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  enforceMaxHeight: PropTypes.bool,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  getSuggestionValue: PropTypes.func.isRequired,
  renderInputComponent: PropTypes.func,
  renderSuggestion: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
  onInputKeyDown: PropTypes.func,
  onInputFocus: PropTypes.func,
  onInputBlur: PropTypes.func.isRequired,
  onSuggestionsFetchRequested: PropTypes.func.isRequired,
  onSuggestionsClearRequested: PropTypes.func.isRequired,
  onSuggestionSelected: PropTypes.func,
  onChange: PropTypes.func
};

export default AutoSuggestInput;
