import type { ReportOpts } from 'web-vitals';

export interface Metric {
  /**
   * The name of the metric (in acronym form).
   */
  name:
    | 'CLS'
    | 'FCP'
    | 'FID'
    | 'INP'
    | 'LCP'
    | 'TTFB'
    | 'RT'
    | 'TBT'
    | 'NTBT'
    | 'ET'
    | 'INP';
  /**
   * The current value of the metric.
   */
  value: number;
  /**
   * The rating as to whether the metric value is within the "good",
   * "needs improvement", or "poor" thresholds of the metric.
   */
  rating: IVitalsScore;
  /**
   * The delta between the current value and the last-reported value.
   * On the first report, `delta` and `value` will always be the same.
   */
  delta?: number;
  /**
   * A unique ID representing this particular metric instance. This ID can
   * be used by an analytics tool to dedupe multiple values sent for the same
   * metric instance, or to group multiple deltas together and calculate a
   * total. It can also be used to differentiate multiple different metric
   * instances sent from the same page, which can happen if the page is
   * restored from the back/forward cache (in that case new metrics object
   * get created).
   */
  id?: string;
  /**
   * Any performance entries relevant to the metric value calculation.
   * The array may also be empty if the metric value was not based on any
   * entries (e.g. a CLS value of 0 given no layout shifts).
   */
  entries?: PerformanceEntry[];
  /**
   * The type of navigation
   *
   * Navigation Timing API (or `undefined` if the browser doesn't
   * support that API). For pages that are restored from the bfcache, this
   * value will be 'back-forward-cache'.
   */
  navigationType?: INavigationType;

  /**
   * An object containing potentially-helpful debugging information that
   * can be sent along with the metric value for the current page visit in
   * order to help identify issues happening to real-users in the field.
   */
  attribution: {
    [key: string]: unknown;
  };
}

export interface IAnalyticsTrackerOptions {
  attribution: object;
  data: IPerfumeData;
  metricName: string;
  navigatorInformation: INavigatorInfo;
  rating: IVitalsScore;
  navigationType?: INavigationType;
  category?: string;
}

interface WebVitalsReportOptions {
  ttfb?: ReportOpts;
  cls?: ReportOpts;
  fcp?: ReportOpts;
  fid?: ReportOpts;
  lcp?: ReportOpts;
  inp?: ReportOpts;
}

export interface IPerfumeConfig {
  // Metrics
  isResourceTiming: boolean;
  isElementTiming: boolean;
  // Analytics
  analyticsTracker?: (options: IAnalyticsTrackerOptions) => void;
  userJourneys?: UserJourneyConfig;
  userJourneySteps?: UserJourneyStepsConfig;
  journeyMaxOutlierThreshold?: number;
  onMarkJourney?: (mark: string, steps: string[]) => void;
  getTimeSinceStartup?: GetTimeSinceStartup;
  // Logging
  maxTime: number;
  // web-vitals report options
  reportOptions: WebVitalsReportOptions;
}

export interface IPerfumeOptions {
  // Metrics
  resourceTiming?: boolean;
  elementTiming?: boolean;
  // Analytics
  analyticsTracker?: (options: IAnalyticsTrackerOptions) => void;
  userJourneys?: UserJourneyConfig;
  userJourneySteps?: UserJourneyStepsConfig;
  journeyMaxOutlierThreshold?: number;
  onMarkJourney?: (mark: string, steps: string[]) => void;
  getTimeSinceStartup?: GetTimeSinceStartup;
  // Logging
  maxMeasureTime?: number;
  // web-vitals report options
  reportOptions?: WebVitalsReportOptions;
}

export interface IMetricMap {
  [measureName: string]: boolean;
}

export interface INavigatorInfo {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  isLowEndDevice?: boolean;
  isLowEndExperience?: boolean;
  serviceWorkerStatus?: 'controlled' | 'supported' | 'unsupported';
}

export interface IPerfObservers {
  [measureName: string]: any;
}

export type IPerformanceObserverType =
  | 'first-input'
  | 'largest-contentful-paint'
  | 'layout-shift'
  | 'longtask'
  | 'measure'
  | 'navigation'
  | 'paint'
  | 'element'
  | 'resource';

export type IPerformanceEntryInitiatorType =
  | 'beacon'
  | 'css'
  | 'fetch'
  | 'img'
  | 'other'
  | 'script'
  | 'xmlhttprequest';

export declare interface IPerformanceEntry {
  decodedBodySize?: number;
  duration: number;
  entryType: IPerformanceObserverType;
  initiatorType?: IPerformanceEntryInitiatorType;
  loadTime: number;
  name: string;
  renderTime: number;
  startTime: number;
  hadRecentInput?: boolean;
  value?: number;
  identifier?: string;
}

// https://wicg.github.io/event-timing/#sec-performance-event-timing
export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: DOMHighResTimeStamp;
  target?: Node;
}

export interface IPerformancePaintTiming {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

export interface IPerfumeNavigationTiming {
  fetchTime?: number;
  workerTime?: number;
  totalTime?: number;
  downloadTime?: number;
  timeToFirstByte?: number;
  headerSize?: number;
  dnsLookupTime?: number;
  redirectTime?: number;
}

export type EffectiveConnectionType = '2g' | '3g' | '4g' | 'slow-2g' | 'lte';

export interface IPerfumeNetworkInformation {
  downlink?: number;
  effectiveType?: EffectiveConnectionType;
  onchange?: () => void;
  rtt?: number;
  saveData?: boolean;
}

export interface IPerfumeDataConsumption {
  beacon: number;
  css: number;
  fetch: number;
  img: number;
  other: number;
  script: number;
  total: number;
  xmlhttprequest: number;
}

export type IPerfumeData =
  | number
  | IPerfumeNavigationTiming
  | IPerfumeNetworkInformation;

export type IVitalsScore = 'good' | 'needsImprovement' | 'poor' | null;

export type GetTimeSinceStartup = () => Promise<number>;


export type INavigationType =
  | 'navigate'
  | 'reload'
  | 'back-forward'
  | 'back-forward-cache'
  | 'prerender';


  export type VitalsThresholds = {
    vitalsThresholds: [number, number];
  };
  export type OutlierThreshold = {
    maxOutlierThreshold: number;
  };
  
  export enum ThresholdTier {
    instant = 'instant',
    quick = 'quick',
    moderate = 'moderate',
    slow = 'slow',
    unavoidable = 'unavoidable',
  }
    
  export enum Rating {
    good = 'good',
    needs_improvement = 'needs_improvement',
    poor = 'poor',
  }
  
  export type UserJourneyThresholdConfig = VitalsThresholds & OutlierThreshold;
  export type UserJourneyThresholds = {
    [key in ThresholdTier]: UserJourneyThresholdConfig;
  };
  
  export type UserJourney<Steps extends string> = {
    steps: Steps[];
  } & Partial<OutlierThreshold>;
  
  export type StepMarks<Marks extends string> = { marks: [Marks | 'launch', Marks] };
  
  export type StepConfig<Marks extends string> = { threshold: ThresholdTier } & StepMarks<Marks>;
  
  export type UserJourneyConfig = Record<string, UserJourney<string>>;
  
  export type UserJourneyStepsConfig = Record<string, StepConfig<string>>;
  
