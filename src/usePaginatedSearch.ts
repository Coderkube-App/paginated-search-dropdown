import { useState, useCallback, useEffect, useRef } from 'react';

export interface LoadOptionsResult<T, Additional = unknown> {
  options: T[];
  hasMore: boolean;
  additional?: Additional;
}

export type LoadOptions<T, Additional = unknown> = (
  search: string,
  prevOptions: T[],
  additional?: Additional
) => Promise<LoadOptionsResult<T, Additional>>;

export interface UsePaginatedSearchProps<T, Additional = unknown> {
  loadOptions: LoadOptions<T, Additional>;
  debounceTimeout?: number;
  initialAdditional?: Additional;
}

export const usePaginatedSearch = <T extends unknown, Additional = unknown>({
  loadOptions,
  debounceTimeout = 300,
  initialAdditional,
}: UsePaginatedSearchProps<T, Additional>) => {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [additional, setAdditional] = useState<Additional | undefined>(initialAdditional);
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Use refs to keep track of current state without triggering re-renders of the effect
  const optionsRef = useRef<T[]>(options);
  const additionalRef = useRef<Additional | undefined>(additional);
  const searchRef = useRef<string>(search);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    additionalRef.current = additional;
  }, [additional]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const loadOptionsRef = useRef(loadOptions);
  useEffect(() => {
    loadOptionsRef.current = loadOptions;
  }, [loadOptions]);

  const fetchOptions = useCallback(
    async (currentSearch: string, isNextPage: boolean = false) => {
      if (isNextPage) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setOptions([]);
        setHasMore(true);
        setAdditional(initialAdditional);
      }

      try {
        const prevOptions = isNextPage ? optionsRef.current : [];
        const result = await loadOptionsRef.current(
          currentSearch,
          prevOptions,
          isNextPage ? additionalRef.current : initialAdditional
        );

        if (isNextPage) {
          setOptions((prev) => [...prev, ...result.options]);
        } else {
          setOptions(result.options);
        }

        setHasMore(result.hasMore);
        setAdditional(result.additional);
      } catch (error) {
        console.error('PaginatedSearchDropdown: Error loading options', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [initialAdditional]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchOptions(search);
    }, debounceTimeout);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, debounceTimeout, fetchOptions]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !isLoadingMore) {
      fetchOptions(searchRef.current, true);
    }
  }, [hasMore, isLoading, isLoadingMore, fetchOptions]);

  return {
    search,
    setSearch,
    options,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  };
};
