import {
  defaultI18n,
  diffDates,
  diffMonths,
  parse,
  format,
  Disabled,
  Queue,
  createDates
} from "./datepicker.helpers";

import { padding, List } from "./util";
import { TypePickerState } from "./datepicker.interface";

const state: TypePickerState = {
  selection: 1,
  startDate: null,
  endDate: null,
  dateFormat: "YYYY-MM-DD",
  limit: 1,
  i18n: defaultI18n(),
  lastSelectedItemCanBeInvalid: false,
  selected: []
};

export function setState(partial: Partial<TypePickerState>, next?: Function) {
  if (partial) {

    
    for (let key in partial) {
      if (state.hasOwnProperty(key)) {
        state[key] = partial[key];
      }
    }
  }
}
export function getState(): TypePickerState {
  return state;
}

/**
 *
 * @param date
 * @param start
 * @param end
 */
export const checkSwitchable = (date: Date) => {
  const { startDate, endDate } = getState();
  if (!startDate || !endDate) {
    return [false, false];
  }
  const endGap = diffMonths(endDate, date);
  const startGap = diffMonths(date, startDate);
  return [startGap > 0 && endGap <= 0, startGap <= 0 && endGap > 0];
};

export function useFormatDate(date: Date): string {
  return format(date, getState().dateFormat);
}

export function useParseDate(date: Date | string): Date {
  return parse(date, getState().dateFormat);
}
export const disables = new Disabled();
export const queue = new Queue();

export const findDisabledBeforeStartDate = (
  startDate: Date | string,
  dateBeforeStartDate: Date | string
) => {
  const _start: Date = useParseDate(startDate);
  const _end: Date = useParseDate(dateBeforeStartDate);
  if (!_start || !_end) {
    return [];
  }
  return createDates(_start, diffDates(_end, _start, true), -1).map(
    useFormatDate
  );
};

export const findDatesBetweenEnqueuedAndInqueue = (current, last) => {
  const size = diffDates(current, last);
  return List.create(size, index => {
    const now = new Date(
      current.getFullYear(),
      current.getMonth(),
      index + current.getDate()
    );
    return useFormatDate(now);
  });
};

export function usePanelTitle(year, month) {
  return getState()
    .i18n.title.toLowerCase()
    .replace(/y{1,}/g, padding(year))
    .replace(/m{1,}/g, getState().i18n.months[month]);
}

export const inDisable = (
  date: Date | null,
  formattedDate: string,
  day: number
) => {
  return disables.oneOf(formattedDate, day) || disables.outofRange(date);
};
