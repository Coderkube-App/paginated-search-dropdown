import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  Keyboard,
  Modal,
  StatusBar,
} from 'react-native';
import { usePaginatedSearch, LoadOptions } from './usePaginatedSearch';

export interface PaginatedSearchDropdownProps<T, Additional = unknown> {
  loadOptions: LoadOptions<T, Additional>;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onSelect: (item: T) => void;
  
  placeholder?: string;
  debounceTimeout?: number;
  initialAdditional?: Additional;
  
  // Custom Styles
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  menuStyle?: ViewStyle;
  itemContainerStyle?: ViewStyle;
  
  // Custom Components
  renderNoResults?: () => React.ReactElement;
  renderLoading?: () => React.ReactElement;
  renderFooter?: () => React.ReactElement;
  renderHeader?: () => React.ReactElement;
  
  // Controls
  closeOnSelect?: boolean;
  statusBarTranslucent?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface PaginatedSearchDropdownHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  setSearch: (text: string) => void;
  close: () => void;
}

const PaginatedSearchDropdownInner = <T extends unknown, Additional = unknown>(
  props: PaginatedSearchDropdownProps<T, Additional>,
  ref: React.ForwardedRef<PaginatedSearchDropdownHandle>
) => {
  const {
    loadOptions,
    renderItem,
    keyExtractor,
    onSelect,
    placeholder = 'Search...',
    debounceTimeout = 300,
    initialAdditional,
    containerStyle,
    inputStyle,
    menuStyle,
    itemContainerStyle,
    renderNoResults,
    renderLoading,
    renderFooter,
    renderHeader,
    closeOnSelect = true,
    statusBarTranslucent = false,
  } = props;

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const containerRef = React.useRef<View>(null);
  const blurTimeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsMenuVisible(true);
    if (props.onFocus) {
      props.onFocus();
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsMenuVisible(false);
      if (props.onBlur) {
        props.onBlur();
      }
    }, 200);
  };

  const {
    search,
    setSearch,
    options,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePaginatedSearch({
    loadOptions,
    debounceTimeout,
    initialAdditional,
  });

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => setSearch(''),
    setSearch: (text: string) => setSearch(text),
    close: () => setIsMenuVisible(false),
  }));



  const handleSelect = (item: T) => {
    onSelect(item);
    if (closeOnSelect) {
      setIsMenuVisible(false);
      Keyboard.dismiss();
    }
  };

  const internalRenderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#6366F1" />
        </View>
      );
    }
    return renderFooter ? renderFooter() : null;
  };

  const renderDropdownContent = () => {
    if (isLoading && !options.length) {
      return renderLoading ? (
        renderLoading()
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    return (
      <FlatList
        style={{ flexGrow: 0, flexShrink: 1 }}
        data={options}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }: { item: T; index: number }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            style={[styles.item, itemContainerStyle]}
          >
            {renderItem(item, index)}
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() =>
          !isLoading ? (
            renderNoResults ? (
              renderNoResults()
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No results found</Text>
              </View>
            )
          ) : null
        }
        ListHeaderComponent={renderHeader}
        ListFooterComponent={internalRenderFooter}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        persistentScrollbar={true}
      />
    );
  };

  const menuStyles = Platform.OS === 'android'
    ? [styles.menuAndroid, menuStyle]
    : [styles.menu, menuStyle];

  return (
    <View
      ref={containerRef}
      style={[styles.container, containerStyle]}
      collapsable={false}
    >
      <TextInput
        ref={inputRef}
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        value={search}
        onChangeText={(text: string) => {
          setSearch(text);
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
          }
          if (!isMenuVisible) {
            setIsMenuVisible(true);
          }
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {isMenuVisible && (
        <View style={menuStyles}>
          {renderDropdownContent()}
        </View>
      )}
    </View>
  );
};

export const PaginatedSearchDropdown = forwardRef(PaginatedSearchDropdownInner) as <
  T extends unknown,
  Additional = unknown
>(
  props: PaginatedSearchDropdownProps<T, Additional> & {
    ref?: React.ForwardedRef<PaginatedSearchDropdownHandle>;
  }
) => React.ReactElement;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  androidMenu: {
    position: 'absolute',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    zIndex: 1001,
  },
  menu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuAndroid: {
    maxHeight: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 8,
    marginTop: 4,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#64748B',
    fontSize: 14,
  },
});
