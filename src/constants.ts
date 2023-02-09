// Have private variable outside the class,
// helps drastically reduce the library size
import {
  UserJourneyThresholds,   
  IPerfumeOptions,
  IPerfumeConfig,
  ThresholdTier,
  UserJourneyConfig,
  UserJourneyStepsConfig, } from './types';
export const W = window;
export const C = W.console;
export const WN = W.navigator;
export const WP = W.performance;
export const getDM = () => (WN as any).deviceMemory;
export const getHC = () => (WN as any).hardwareConcurrency;

export const USER_JOURNEY_THRESHOLDS: UserJourneyThresholds = {
    [ThresholdTier.instant]: {
      vitalsThresholds: [100, 200],
      maxOutlierThreshold: 10000,
    },
    [ThresholdTier.quick]: {
      vitalsThresholds: [200, 500],
      maxOutlierThreshold: 10000,
    },
    [ThresholdTier.moderate]: {
      vitalsThresholds: [500, 1000],
      maxOutlierThreshold: 10000,
    },
    [ThresholdTier.slow]: {
      vitalsThresholds: [1000, 2000],
      maxOutlierThreshold: 10000,
    },
    [ThresholdTier.unavoidable]: {
      vitalsThresholds: [2000, 5000],
      maxOutlierThreshold: 20000,
    },
  };
  const userJourneys: UserJourneyConfig = {
    onboarding: {
      steps: [
        'load_signed_out_splash_screen',
        'load_import_screen',
        'load_protect_screen',
        'load_home_screen',
      ],
    },
    simple_flow: {
      steps: [
        'load_home_screen_from_launch',
        'load_second_screen',
        'load_preview_screen',
        'load_confirmation',
      ],
    },
  };
  
  const userJourneySteps: UserJourneyStepsConfig = {
    load_signed_out_splash_screen: {
      threshold: ThresholdTier.unavoidable,
      marks: ['launch', 'loaded_signed_out_splash_screen'],
    },
    load_import_screen: {
      threshold: ThresholdTier.instant,
      marks: ['start_navigate_to_import_screen', 'loaded_import_screen'],
    },
    load_protect_screen: {
      threshold: ThresholdTier.quick,
      marks: ['start_navigate_to_protect_screen', 'loaded_protect_screen'],
    },
    load_home_screen: {
      threshold: ThresholdTier.quick,
      marks: ['start_navigate_to_home_screen', 'loaded_home_screen'],
    },
    load_home_screen_from_launch: {
      threshold: ThresholdTier.unavoidable,
      marks: ['launch', 'loaded_home_screen'],
    },
    load_second_screen: {
      threshold: ThresholdTier.instant,
      marks: ['start_navigate_to_second_screen', 'loaded_second_screen'],
    },
    load_preview_screen: {
      threshold: ThresholdTier.quick,
      marks: ['start_navigate_to_preview_screen', 'loaded_preview_screen'],
    },
    load_confirmation: {
      threshold: ThresholdTier.quick,
      marks: ['start_navigate_to_confirmation_screen', 'loaded_confirmation_screen'],
    },
  };
  
  export const testConfig: IPerfumeOptions = {
    userJourneys,
    userJourneySteps,
    onMarkJourney: jest.fn(),
  };
  
  export type TestConfig = IPerfumeConfig;
