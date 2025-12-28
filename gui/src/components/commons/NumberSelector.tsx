import { Control, Controller } from 'react-hook-form';
import { Button } from './Button';
import { Typography } from './Typography';
import { useCallback, useMemo, useState } from 'react';
import { useLocaleConfig } from '@/i18n/config';

function getDecimalPlaces(n: number): number {
  if (!Number.isFinite(n)) return 0;
  // Handle scientific notation like 1e-3
  const s = n.toString().toLowerCase();
  const eIndex = s.indexOf('e-');
  if (eIndex !== -1) {
    const exp = Number(s.slice(eIndex + 2));
    const base = s.slice(0, eIndex);
    const baseDecimals = base.includes('.') ? base.split('.')[1]!.length : 0;
    return (Number.isFinite(exp) ? exp : 0) + baseDecimals;
  }
  return s.includes('.') ? s.split('.')[1]!.length : 0;
}

function roundTo(n: number, decimals: number): number {
  // Guard against toFixed throwing on huge decimals
  const d = Math.max(0, Math.min(12, decimals));
  return +n.toFixed(d);
}

export function NumberSelector({
  label,
  valueLabelFormat,
  control,
  name,
  min,
  max,
  step,
  doubleStep,
  disabled = false,
  showButtonWithNumber = false,
  input,
}: {
  label?: string;
  valueLabelFormat?: (value: number) => string;
  control: Control<any>;
  name: string;
  min: number;
  max: number;
  step: number | ((value: number, add: boolean) => number);
  doubleStep?: number;
  disabled?: boolean;
  showButtonWithNumber?: boolean;
  input?: {
    enabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    toInput?: (value: number) => number;
    fromInput?: (value: number) => number;
    decimals?: number;
  };
}) {
  const { currentLocales } = useLocaleConfig();

  const [inputStr, setInputStr] = useState<string | null>(null);

  const internalPrecision = useMemo(() => {
    if (typeof step === 'number') {
      return Math.max(
        getDecimalPlaces(step),
        doubleStep === undefined ? 0 : getDecimalPlaces(doubleStep)
      );
    }
    // For functional steps we don't force rounding here.
    return 6;
  }, [step, doubleStep]);

  const stepFn =
    typeof step === 'function'
      ? step
      : (value: number, add: boolean) =>
          roundTo(add ? value + step : value - step, internalPrecision);

  const doubleStepFn = useCallback(
    (value: number, add: boolean) =>
      doubleStep === undefined
        ? 0
        : roundTo(add ? value + doubleStep : value - doubleStep, internalPrecision),
    [doubleStep, internalPrecision]
  );

  const decimalFormat = useMemo(
    () =>
      new Intl.NumberFormat(currentLocales, {
        style: 'decimal',
        maximumFractionDigits: 2,
        signDisplay: 'exceptZero',
      }),
    [currentLocales]
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const safeValue = typeof value === 'number' ? value : min;
        return (
          <div className="flex flex-col gap-1 w-full">
          <Typography bold>{label}</Typography>
          <div className="flex gap-5 bg-background-60 p-2 rounded-lg">
            <div className="flex gap-1">
              {doubleStep !== undefined && (
                <Button
                  variant="tertiary"
                  rounded
                  onClick={() =>
                    onChange(
                      Math.min(
                        max,
                        Math.max(
                          min,
                          roundTo(
                            doubleStepFn(safeValue, false),
                            internalPrecision
                          )
                        )
                      )
                    )
                  }
                  disabled={disabled || safeValue <= min}
                >
                  {showButtonWithNumber
                    ? decimalFormat.format(-doubleStep)
                    : '--'}
                </Button>
              )}
              <Button
                variant="tertiary"
                rounded
                onClick={() =>
                  onChange(
                    Math.min(
                      max,
                      Math.max(
                        min,
                        roundTo(stepFn(safeValue, false), internalPrecision)
                      )
                    )
                  )
                }
                disabled={disabled || safeValue <= min}
              >
                -
              </Button>
            </div>
            <div className="flex flex-grow justify-center text-center items-center min-w-10 text-standard">
              {input?.enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    className="bg-background-70 border border-background-70 rounded-md px-2 py-1 text-standard text-background-10 w-24 text-center focus:outline-transparent focus:border-accent-background-40"
                    type="number"
                    inputMode="decimal"
                    disabled={disabled}
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={
                      inputStr ??
                      String(
                        roundTo(
                          (input.toInput
                            ? input.toInput(safeValue)
                            : safeValue) ?? 0,
                          input.decimals ??
                            (input.step !== undefined
                              ? getDecimalPlaces(input.step)
                              : 2)
                        )
                      )
                    }
                    onFocus={() => {
                      setInputStr(
                        String(
                          roundTo(
                            (input.toInput
                              ? input.toInput(safeValue)
                              : safeValue) ?? 0,
                            input.decimals ??
                              (input.step !== undefined
                                ? getDecimalPlaces(input.step)
                                : 2)
                          )
                        )
                      );
                    }}
                    onBlur={() => setInputStr(null)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setInputStr(raw);
                      const parsed = Number(raw);
                      if (!Number.isFinite(parsed)) return;
                      const internal =
                        input.fromInput !== undefined
                          ? input.fromInput(parsed)
                          : parsed;
                      const clamped = Math.min(
                        max,
                        Math.max(min, roundTo(internal, internalPrecision))
                      );
                      onChange(clamped);
                    }}
                  />
                  {input.suffix && (
                    <span className="text-background-20">{input.suffix}</span>
                  )}
                </div>
              ) : (
                (valueLabelFormat ? valueLabelFormat(safeValue) : safeValue)
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="tertiary"
                rounded
                onClick={() =>
                  onChange(
                    Math.min(
                      max,
                      Math.max(
                        min,
                        roundTo(stepFn(safeValue, true), internalPrecision)
                      )
                    )
                  )
                }
                disabled={disabled || safeValue >= max}
              >
                +
              </Button>
              {doubleStep !== undefined && (
                <Button
                  variant="tertiary"
                  rounded
                  onClick={() =>
                    onChange(
                      Math.min(
                        max,
                        Math.max(
                          min,
                          roundTo(
                            doubleStepFn(safeValue, true),
                            internalPrecision
                          )
                        )
                      )
                    )
                  }
                  disabled={disabled || safeValue >= max}
                >
                  {showButtonWithNumber
                    ? decimalFormat.format(doubleStep)
                    : '++'}
                </Button>
              )}
            </div>
          </div>
        </div>
        );
      }}
    />
  );
}
