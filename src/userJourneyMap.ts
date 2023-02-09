import { StepConfig, UserJourney, IVitalsScore } from './types';

import { config } from './config';


export const userJourneyMap = {
    finalMarkToStepsMap: new Map<string, Map<string, string[]>>(),
    startMarkToStepsMap: {} as Record<string, Set<string>>,
    finalSteps: new Map<string, string[]>(),
    activeSteps: new Set<string>(),
  };
  
  export function resetActiveSteps() {
    userJourneyMap.activeSteps = new Set<string>();
  }
  
  export function resetUserJourneyMap() {
    // reset all values
    userJourneyMap.startMarkToStepsMap = {};
    userJourneyMap.finalMarkToStepsMap = new Map<string, Map<string, string[]>>();
    userJourneyMap.finalSteps = new Map<string, string[]>();
    resetActiveSteps();
  }
  
  export function setUserJourneyStepsMap() {
    if (!config.userJourneySteps) {
      return;
    }
  
    resetUserJourneyMap();
  
    Object.entries<StepConfig<string>>(config.userJourneySteps).forEach(([step, { marks }]) => {
      const startMark = marks[0];
      const endMark = marks[1];

      // TODO -  currently broken, sets all values as an empty {}, ex "launch": {}
      userJourneyMap.startMarkToStepsMap[startMark] = new Set<string>([
        ...(userJourneyMap.startMarkToStepsMap[startMark] ?? []),
        step,
      ]);
  
      if (!userJourneyMap.finalMarkToStepsMap.has(endMark)) {
        // insert when top level end mark is not present
        // TODO - currently broken, doesnt set any value
        userJourneyMap.finalMarkToStepsMap.set(endMark, new Map([[startMark, [step]]]));
      } else if (!userJourneyMap.finalMarkToStepsMap.get(endMark)?.has(startMark)) {
        // insert when top level end mark is present but second level start mark is not
        // TODO - currently broken, doesnt set any value
        userJourneyMap.finalMarkToStepsMap.get(endMark)?.set(startMark, [step]);
      } else {
        // insert when end mark and start mark are both presen
        // TODO - currently broken, doesnt set any value
        userJourneyMap.finalMarkToStepsMap.get(endMark)?.get(startMark)?.push(step);
      }
    });
  }
  
  export function setUserJourneyFinalStepsMap() {
    if (!config.userJourneys) {
      return;
    }
    // reset values
    userJourneyMap.finalSteps = new Map<string, string[]>();
  
    Object.entries<UserJourney<string> | StepConfig<string>>(config.userJourneys).forEach(
      ([key, value]) => {
        if (key !== 'steps') {
          const { steps } = value as UserJourney<string>;
          const finalStep = steps[steps.length - 1];
          if (userJourneyMap.finalSteps.has(finalStep)) {
            // TODO - currently broken, doesnt update map
            userJourneyMap.finalSteps.get(finalStep)?.push(key);
          } else {
            //TODO - currently broken, doesnt update map
            userJourneyMap.finalSteps.set(finalStep, [key]);
          }
        }
      },
    );
  }
  
  /**
   * this method allows to add new steps by passing the start mark
   * @param startMark
   */
  export function addActiveSteps(startMark: string) {
    const newSteps = userJourneyMap.startMarkToStepsMap[startMark] ?? [];
    //TODO - currently broken, doesnt update map
    userJourneyMap.activeSteps = new Set<string>([...userJourneyMap.activeSteps, ...newSteps]);
  }
  
  /**
   * removes one step from active steps
   * @param step
   */
  export function removeActiveStep(step: string) {
    userJourneyMap.activeSteps.delete(step);
  }
  