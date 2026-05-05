import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';

type CountryOption = { name: string; code: string };

type CountryComboboxProps = {
  value: string;
  onChange: (code: string) => void;
  countries: ReadonlyArray<CountryOption>;
  placeholder?: string;
  className?: string;
};

export function CountryCombobox({
  value,
  onChange,
  countries,
  placeholder = 'Country',
  className,
}: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = countries.find(c => c.code === value);
  const filtered = search
    ? countries.filter(
        c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild={true}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between font-normal', !selected?.name && 'text-muted-foreground', className)}
        >
          <span className="truncate flex-1 text-left">{selected?.name ?? placeholder}</span>
          <span className="flex items-center gap-0.5 shrink-0 ml-1">
            {value && (
              <button
                type="button"
                aria-label="Clear country"
                className="rounded-sm p-0.5 hover:bg-muted"
                onClick={e => {
                  e.stopPropagation();
                  onChange('');
                }}
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            )}
            <ChevronsUpDown aria-hidden="true" className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus={true}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto px-1 pb-1">
          {filtered.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No country found.</p>}
          {filtered.map(country => (
            <button
              key={country.code}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                value === country.code && 'bg-accent text-accent-foreground'
              )}
              onClick={() => {
                onChange(country.code);
                setOpen(false);
                setSearch('');
              }}
            >
              <Check
                aria-hidden="true"
                className={cn('size-3.5 shrink-0', value === country.code ? 'opacity-100' : 'opacity-0')}
              />
              {country.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
