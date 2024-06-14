/**
 * Debounce - with support for multiple callers
 * @param fn - The function you want to run after a set @ms
 * @param ms - The time before running the @fn. In this time-window the method can be cancelled by another call this debounce method (with the same @caller)
 * @param caller - All callers with the same name will cancel another
 */
export const debounce = (fn: () => void, ms = 500, caller = "any"): void => {
  delayed();

  function delayed(this: any, ...args: any) {
    const already_in_queue = callers[caller];
    clearTimeout(already_in_queue);
    callers[caller] = setTimeout(() => {
      fn.apply(this, args);
      delete callers[caller]; // Remember to collect your garbage
    }, ms);
  }
};

const callers: Record<string, string | number | NodeJS.Timeout> = {}; // Store all ongoing-timers for all "callers".
