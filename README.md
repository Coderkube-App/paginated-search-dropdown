# Paginated Search Dropdown

A highly customizable, paginated async search dropdown for React Native (Expo and Bare).

## Features

- **Async Search** - Load options dynamically based on search query
- **Pagination** - Built-in infinite scroll support for loading more results
- **Debounce** - Configurable debounce to prevent excessive API calls
- **Android Touch & Scroll Perfected** - Native flow-based rendering on Android to prevent touch-clipping and parent ScrollView scroll-gesture conflicts
- **Customizable** - Full control over styling and rendering
- **Imperative Controls** - Focus, blur, clear, and set search text via ref
- **TypeScript** - Full TypeScript support with generic types

## Installation

```bash
npm install paginated-search-dropdown
```

or

```bash
yarn add paginated-search-dropdown
```

## Usage

```tsx
import { PaginatedSearchDropdown } from 'paginated-search-dropdown';

interface User {
  id: string;
  name: string;
  email: string;
}

const loadOptions = async (search: string, prevOptions: User[]): Promise<{
  options: User[];
  hasMore: boolean;
}> => {
  const response = await fetch(
    `https://api.example.com/users?q=${search}&offset=${prevOptions.length}`
  );
  const data = await response.json();
  return {
    options: data.users,
    hasMore: data.hasMore,
  };
};

const renderItem = (item: User) => (
  <View>
    <Text>{item.name}</Text>
    <Text style={{ fontSize: 12, color: '#666' }}>{item.email}</Text>
  </View>
);

export default function App() {
  const handleSelect = (user: User) => {
    console.log('Selected:', user);
  };

  return (
    <PaginatedSearchDropdown
      loadOptions={loadOptions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onSelect={handleSelect}
      placeholder="Search users..."
    />
  );
}
```

## API

### PaginatedSearchDropdown Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loadOptions` | `LoadOptions<T, Additional>` | Required | Async function to load options |
| `renderItem` | `(item: T, index: number) => ReactElement` | Required | Render function for each item |
| `keyExtractor` | `(item: T, index: number) => string` | Required | Key extractor for FlatList |
| `onSelect` | `(item: T) => void` | Required | Callback when item is selected |
| `placeholder` | `string` | `'Search...'` | Placeholder text |
| `debounceTimeout` | `number` | `300` | Debounce delay in milliseconds |
| `initialAdditional` | `Additional` | `undefined` | Initial additional data |
| `containerStyle` | `ViewStyle` | `undefined` | Container styles |
| `inputStyle` | `ViewStyle` | `undefined` | Input field styles |
| `menuStyle` | `ViewStyle` | `undefined` | Dropdown menu styles |
| `itemContainerStyle` | `ViewStyle` | `undefined` | Item container styles |
| `renderNoResults` | `() => ReactElement` | `undefined` | Custom no results component |
| `renderLoading` | `() => ReactElement` | `undefined` | Custom loading component |
| `renderFooter` | `() => ReactElement` | `undefined` | Custom footer component |
| `renderHeader` | `() => ReactElement` | `undefined` | Custom header component |
| `closeOnSelect` | `boolean` | `true` | Close dropdown on selection |
| `statusBarTranslucent` | `boolean` | `false` | Adjusts menu spacing under status bar |
| `onFocus` | `() => void` | `undefined` | Callback when search input is focused |
| `onBlur` | `() => void` | `undefined` | Callback when search input is blurred |

### PaginatedSearchDropdownHandle

Imperative methods available via ref:

```tsx
const ref = useRef<PaginatedSearchDropdownHandle>(null);

ref.current?.focus();      // Focus the input
ref.current?.blur();       // Blur the input
ref.current?.clear();      // Clear the search text
ref.current?.setSearch('custom text'); // Set custom search text
```

### LoadOptions Function

```tsx
type LoadOptions<T, Additional = unknown> = (
  search: string,           // Current search text
  prevOptions: T[],         // Previously loaded options
  additional?: Additional   // Additional data from previous page
) => Promise<{
  options: T[];      // New options to add
  hasMore: boolean;  // Whether more pages are available
  additional?: Additional; // Additional data to pass to next page
}>;
```

## Hook Usage

You can also use the `usePaginatedSearch` hook directly for more control:

```tsx
import { usePaginatedSearch } from 'paginated-search-dropdown';

const MyComponent = () => {
  const {
    search,
    setSearch,
    options,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = usePaginatedSearch({
    loadOptions: myLoadFunction,
    debounceTimeout: 300,
  });

  // Custom implementation...
};
```

## Requirements

- React >= 16.8.0
- React Native >= 0.60.0 (works with Expo and Bare workflows)

## License

MIT