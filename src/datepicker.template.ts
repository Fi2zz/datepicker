import { DateTag, node } from "./datepicker.interface";
import { isDef, isNotEmpty, List } from "./util";
import { DOMHelpers } from "./datepicker.dom.helper";

/**
 *
 * @param tag
 * @param props
 * @param children
 * @param render
 * @returns {string}
 */
function tag({ tag, props = {} }: node): string {
  if (!tag) {
    return "";
  }
  let children: any = "";

  let attributes = <string[]>[];
  for (let key in props) {
    let value = props[key];

    if (key === "className") {
      key = "class";
    }

    if (key !== "children") {
      if (isDef(value)) {
        attributes.push(`${key}="${value}"`);
      }
    } else {
      if (children !== false && children !== undefined && children !== null) {
        if (Array.isArray(value)) {
          children = value.filter(isDef).join("");
        } else {
          children = value;
        }
      }
    }
  }
  let attrs = <string>attributes.join("");
  return `<${tag} ${attrs}>${children}</${tag}>`;
}

/**
 *
 * @param {boolean} reachStart
 * @param {boolean} reachEnd
 * @returns {(string)[]}
 */

function createActionView(reachStart: boolean, reachEnd: boolean): (string)[] {
  const node = (type, disabled) => {
    const className = ["calendar-action", type];
    if (disabled) {
      className.push("disabled");
    }
    return tag({
      tag: "div",
      props: {
        className: List.string(className, " "),
        disabled: disabled ? "disabled" : null
      }
    });
  };
  return [node("prev", reachStart), node("next", reachEnd)];
}

/**
 *
 * @param {DateTag} data
 * @returns {string}
 */
function createDateTag(data: DateTag): string {
  const nodeChildren = [];
  if (isNotEmpty(data.date)) {
    nodeChildren.push(
      tag({
        tag: "div",
        props: {
          className: "date",
          children: data.date
        }
      })
    );
  }

  if (data.value) {
    nodeChildren.push(
      tag({
        tag: "div",
        props: {
          className: "placeholder"
        }
      })
    );
  }

  const props = {
    className: DOMHelpers.class.cell(data.day, data.className),
    children: nodeChildren
  };

  if (isNotEmpty(data.disabled)) {
    props["data-disabled"] = data.disabled;
  }
  if (isNotEmpty(data.value)) {
    props["data-date"] = data.value;
  }
  return tag({
    tag: "div",
    props
  });
}

/**
 *
 * @param {number} year
 * @param {number} month
 * @param {string} title
 * @returns {string}
 */
const headView = (title: string): string =>
  tag({
    tag: "div",
    props: {
      className: "calendar-head",
      children: [
        tag({
          tag: "div",
          props: {
            className: "calendar-title",
            children: title
          }
        })
      ]
    }
  });

/**
 *
 * @param {string | any[]} children
 * @returns {string}
 */
const mainView = (children: string | any[]): string =>
  tag({
    tag: "div",
    props: {
      className: "calendar-item",
      children
    }
  });

/**
 *
 * @param {Array<any>} dates
 * @returns {string}
 */
const bodyView = (dates: Array<any>): string =>
  tag({
    tag: "div",
    props: {
      className: "calendar-body",
      children: dates.map(item => createDateTag(item))
    }
  });

/**
 *
 * @param {string} weekView
 * @returns {(item: any) => string}
 */
const mapView = (weekView: string): ((item: any) => string) => (item: any) =>
  mainView([headView(item.heading), weekView, bodyView(item.dates)]);

/**
 *
 * @param {Array<any>} data
 * @param weekView
 * @returns {string[]}
 */
const createView = (data: Array<any>, weekView: string): string[] =>
  data.map(mapView(weekView)).filter(isNotEmpty);

/**
 *
 * @param {string} day
 * @param {number} index
 * @returns {string}
 */
const createWeekViewMapper = (day: string, index: number): string =>
  tag({
    tag: "div",
    props: {
      className: DOMHelpers.class.cell(index),
      children: day
    }
  });

/**
 *
 * @param {Array<string>} week
 * @returns {string}
 */
const createWeekView = (week: Array<string>): string =>
  tag({
    tag: "div",
    props: {
      className: "calendar-day",
      children: week.map(createWeekViewMapper)
    }
  });

export function template({
  data,
  days,
  reachStart,
  reachEnd,
  switchable
}): string {
  const dayView = createWeekView(days);
  const mainView = createView(data, !switchable ? "" : dayView);
  let actionView = [];
  if (!switchable) {
    mainView.unshift(dayView);
  } else {
    actionView = createActionView(reachStart, reachEnd);
  }
  return List.string([...actionView, ...mainView]);
}
