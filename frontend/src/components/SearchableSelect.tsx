import { useEffect, useId, useRef, useState } from 'react';

type CommonProps = {
  label: string;
  options: string[];
  placeholder: string;
  required?: boolean;
};

type SingleSelectProps = CommonProps & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiSelectProps = CommonProps & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type SearchableSelectProps = SingleSelectProps | MultiSelectProps;

export default function SearchableSelect(props: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const listboxId = `${id}-options`;
  const selectedValues = props.multiple ? props.value : props.value ? [props.value] : [];
  const visibleOptions = props.options.filter((option) =>
    option.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  const selectOption = (option: string) => {
    if (props.multiple) {
      props.onChange(
        props.value.includes(option)
          ? props.value.filter((value) => value !== option)
          : [...props.value, option],
      );
      setQuery('');
      setActiveIndex(0);
      inputRef.current?.focus();
      return;
    }

    props.onChange(option);
    setQuery('');
    setOpen(false);
  };

  const removeOption = (option: string) => {
    if (props.multiple) {
      props.onChange(props.value.filter((value) => value !== option));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => current < 0 ? 0 : Math.min(current + 1, visibleOptions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => current < 0 ? visibleOptions.length - 1 : Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && open && visibleOptions.length > 0) {
      event.preventDefault();
      selectOption(visibleOptions[activeIndex] || visibleOptions[0]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={rootRef} className="relative mt-1">
      <div className="flex min-h-[42px] w-full flex-wrap items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        {props.multiple && selectedValues.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
            {value}
            <button
              type="button"
              onClick={() => removeOption(value)}
              aria-label={`Remove ${value}`}
              className="rounded px-0.5 text-blue-700 hover:bg-blue-100"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && activeIndex >= 0 && visibleOptions[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
          aria-required={props.required || undefined}
          autoComplete="off"
          value={open || props.multiple ? query : props.value}
          aria-label={props.label}
          onFocus={() => {
            setOpen(true);
            setActiveIndex(-1);
          }}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={props.placeholder}
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
        />
      </div>

      {open && (
        <div id={listboxId} role="listbox" aria-multiselectable={props.multiple || undefined} className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {visibleOptions.length > 0 ? visibleOptions.map((option, index) => {
            const selected = selectedValues.includes(option);
            return (
              <button
                key={option}
                id={`${listboxId}-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`w-full px-3 py-2 text-left text-sm ${index === activeIndex ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'} ${selected ? 'font-semibold' : ''}`}
              >
                {option}{selected && props.multiple ? ' (selected)' : ''}
              </button>
            );
          }) : (
            <div role="status" className="px-3 py-2 text-sm text-slate-500">No matching options</div>
          )}
        </div>
      )}
    </div>
  );
}