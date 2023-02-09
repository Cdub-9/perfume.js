import { StepConfig, UserJourney, IVitalsScore } from './types';

import { config } from './config';

import { getJourneyMarkName } from './utils';
import { USER_JOURNEY_THRESHOLDS, WP } from './constants';
import { reportPerf } from './reportPerf';

import { userJourneyMap, addActiveSteps, removeActiveStep } from './userJourneyMap';

function getJourneyStepMetricName(step: string) {
  return `user_journey_step.${step}`;
}

function getJourneyStepVitalMetricName(step: string, rating: IVitalsScore) {
  return `user_journey_step.${step}_vitals_${rating}`;
}

function getJourneyMetricName(journey: string) {
  return `user_journey.${journey}`;
}

function getRating(value: number, vitalsThresholds: [number, number]): IVitalsScore {
  if (value <= vitalsThresholds[0]) {
    return 'good';
  }
  return value <= vitalsThresholds[1] ? 'needsImprovement' : 'poor'
}

function measureJourney(step: string) {
  console.log('in measure journey with finalSteps as: ' + JSON.stringify(userJourneyMap.finalSteps))
  if (userJourneyMap.finalSteps.has(step)) {
    const journeys = userJourneyMap.finalSteps.get(step);
    journeys?.forEach((journey) => {
      if (journey === 'steps') {
        return;
      }
      if (!config.userJourneys) {
        return;
      }
      const { steps, maxOutlierThreshold } = config.userJourneys[journey];
      let journeyDuration = 0;
      let everyStepIsMeasured = true;
      let finalStepEndTime;
      steps.forEach((journeyStep, index) => {
        if (!everyStepIsMeasured) {
          return;
        }
        const journeyStepMetricName = getJourneyStepMetricName(journeyStep);
        const journeyStepEntries =
          WP.getEntriesByName(journeyStepMetricName);
        if (journeyStepEntries.length === 0) {
          everyStepIsMeasured = false;
        } else {
          const lastEntry = journeyStepEntries[journeyStepEntries.length - 1];
          journeyDuration += lastEntry.duration;
          if (index === steps.length - 1) {
            finalStepEndTime = lastEntry.startTime + lastEntry.duration;
          }
        }
      });
      // TODO finalize a max threshold number
      const threshold = (maxOutlierThreshold ?? config.journeyMaxOutlierThreshold) ?? 100000;
      if (everyStepIsMeasured && journeyDuration <= threshold) {
        const journeyMetricName = getJourneyMetricName(journey);
        // Do not want to measure or log negative metrics
        if (journeyDuration >= 0) {
          reportPerf(journey, journeyDuration, null, {}, undefined, 'user_journey');
          WP.measure(journeyMetricName, {
            start: finalStepEndTime ? finalStepEndTime - journeyDuration : finalStepEndTime,
            end: finalStepEndTime,
            detail: {
              type: 'userJourney',
              duration: journeyDuration,
            },
          });
        }
      }
    });
  }
}

async function measureJourneyStep(step: string, startMark: string, endMark: string) {
  const journeyStepMetricName = getJourneyStepMetricName(step);
  const startMarkName = getJourneyMarkName(startMark);
  const endMarkName = getJourneyMarkName(endMark);

  const isLaunchJourney = startMark === 'launch';
  const startMarkExists = WP.getEntriesByName(startMarkName).length > 0;
  const endMarkExists = WP.getEntriesByName(endMarkName).length > 0;
  if (!endMarkExists || !config.userJourneySteps) {
    return;
  }

  const { maxOutlierThreshold, vitalsThresholds } =
    USER_JOURNEY_THRESHOLDS[config.userJourneySteps[step].threshold];

  if (isLaunchJourney) {
    // IN RN it is based off of the react-natve-startup-time package, do we need this in web? I dont think so 
    // const duration = await config.getTimeSinceStartup();
    const duration = 0;
    const journeyStepMeasure = WP.measure(journeyStepMetricName, {
      duration,
      end: endMarkName,
    });
    const score = getRating(duration, vitalsThresholds);
    // Do not want to measure or log negative metrics
    if (duration >= 0) {
      reportPerf(step, journeyStepMeasure.duration, score, {}, undefined, 'user_journey_step');
      measureJourney(step);
    }
  } else if (startMarkExists) {
    const journeyStepMeasure = WP.measure(
      journeyStepMetricName,
      startMarkName,
      endMarkName,
    );
    const { duration } = journeyStepMeasure;
    if (duration <= maxOutlierThreshold) {
      const score = getRating(duration, vitalsThresholds);
      // Do not want to measure or log negative metrics
      if (duration >= 0) {
        reportPerf(step, duration, score, {}, undefined, 'user_journey_step');
        const journeyStepVitalMetricName = getJourneyStepVitalMetricName(step, score);
        WP.measure(journeyStepVitalMetricName, {
          start: journeyStepMeasure.startTime + journeyStepMeasure.duration,
          end: journeyStepMeasure.startTime + journeyStepMeasure.duration,
          detail: {
            type: 'userJourneyStepVital',
            duration,
          },
        });
      }
    }
    measureJourney(step);
  }
}

function measureJourneySteps(endMark: string) {
  if (userJourneyMap.finalMarkToStepsMap.has(endMark)) {
    // this is an end mark so we delete the entry
    userJourneyMap.finalMarkToStepsMap.get(endMark)?.forEach((steps, startMark) => {
      steps.forEach(removeActiveStep);

      Promise.all(
        steps.map(async (step) => {
          // measure
          await measureJourneyStep(step, startMark, endMark);
        }),
      ).catch(() => {
        // TODO @zizzamia log error
      });
    });
  } else {
    addActiveSteps(endMark);
  }

  config.onMarkJourney?.(endMark, Array.from(userJourneyMap.activeSteps));

}

/**
 * Function which creates a journey mark with a name generated
 * from the provided mark when called.
 *
 * The generated mark name has the following format:
 * `user_journey_mark.${mark}`
 *
 * @param mark string that represents the mark
 */
export function markJourney(mark: string) {
  const markName = getJourneyMarkName(mark);
  WP.mark(markName);
  measureJourneySteps(mark);
}

/**
 * Function which creates a journey mark with a name generated
 * from the provided mark if a mark with the same name does not
 * already exist when called.
 *
 * The generated mark name has the following format:
 * `user_journey_mark.${mark}`
 *
 * @param mark string that represents the mark
 */
export function markJourneyOnce(mark: string) {
  const markName = getJourneyMarkName(mark);
  if (WP.getEntriesByName(markName).length === 0) {
    WP.mark(markName);
    measureJourneySteps(mark);
  }
}
