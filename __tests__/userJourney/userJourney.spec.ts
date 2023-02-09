/**
 * @jest-environment jsdom
 */
import { WP } from '../../src/constants';
import mock from '.././_mock';
import Perfume from '../../src/perfume'
import { markJourney, markJourneyOnce } from '../../src/userJourney';
import { config } from '../../src/config';

import { testConfig } from '../../src/constants';

describe('markJourneyOnce', () => {
  let spy: jest.SpyInstance;
  let analyticsTrackerSpy: jest.SpyInstance; 
  let measureSpy: jest.SpyInstance;
  let onMarkJourneySpy: jest.SpyInstance;

  beforeEach(() => {
    (WP as any) = mock.performance();
    const perfume = new Perfume(testConfig);
  });

  afterEach(() => {
    if (spy) {
      spy.mockReset();
      spy.mockRestore();
    }
  })

  describe('when two marks are not part of the same step', () => {
    it('should not run analyticsTracker', () => {
        config.analyticsTracker = () => {};
        spy = jest.spyOn(WP, 'mark'); 
        analyticsTrackerSpy = jest.spyOn(config, 'analyticsTracker');     
        markJourney('start_navigate_to_second_screen');
        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith('user_journey_mark.start_navigate_to_second_screen');
        markJourney('start_navigate_to_preview_screen');
        expect(spy.mock.calls.length).toBe(2);
        expect(spy).toHaveBeenLastCalledWith('user_journey_mark.start_navigate_to_preview_screen');
        expect(analyticsTrackerSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('when two marks are apart of the same step', () => {
    it('shold run analyticsTracker', () => {
        config.analyticsTracker = () => {};
        spy = jest.spyOn(WP, 'mark'); 
        measureSpy = jest.spyOn(WP, 'measure');
        analyticsTrackerSpy = jest.spyOn(config, 'analyticsTracker'); 
        markJourney('start_navigate_to_protect_screen');
        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith('user_journey_mark.start_navigate_to_protect_screen');
        // ============ Mock Data ============
        jest.spyOn(WP, 'getEntriesByName').mockImplementationOnce((name) => {
            const entries: Record<string, PerformanceEntry> = {
            'user_journey_mark.start_navigate_to_protect_screen': {
                name: 'user_journey_mark.start_navigate_to_protect_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 0,
                toJSON: jest.fn(),
            },
            };
            return [entries[name]] ?? [];
        });
        jest.spyOn(WP, 'measure').mockImplementationOnce(() => ({
            name: 'user_journey_mark.start_navigate_to_protect_screen',
            entryType: 'mark',
            duration: 100,
            startTime: 0,
            toJSON: jest.fn(),
            detail: '',
        }));
        // ========== Mock Data end ==========
        expect(analyticsTrackerSpy).toHaveBeenCalledTimes(0);
      // ============ Mock Data ============
      jest.spyOn(WP, 'getEntriesByName').mockImplementationOnce((name) => {
        const entries: Record<string, PerformanceEntry> = {
          'user_journey_mark.start_navigate_to_protect_screen': {
            name: 'user_journey_mark.start_navigate_to_protect_screen',
            entryType: 'mark',
            duration: 0,
            startTime: 0,
            toJSON: jest.fn(),
          },
          'user_journey_mark.loaded_protect_screen': {
            name: 'user_journey_mark.loaded_protect_screen',
            entryType: 'mark',
            duration: 0,
            startTime: 100,
            toJSON: jest.fn(),
          },
        };
        return [entries[name]] ?? [];
      });
      // ========== Mock Data end ==========
      markJourney('loaded_protect_screen');
      expect(spy.mock.calls.length).toBe(2);
      expect(spy).toHaveBeenLastCalledWith(
        'user_journey_mark.loaded_protect_screen',
      );
      expect(measureSpy).toHaveBeenCalledTimes(2);
      expect(measureSpy).toHaveBeenCalledWith(
        'user_journey_step.load_protect_screen',
        'user_journey_mark.start_navigate_to_protect_screen',
        'user_journey_mark.loaded_protect_screen',
      );
      expect(measureSpy).toHaveBeenLastCalledWith(
        'user_journey_step.load_protect_screen_vitals_good',
        {
          detail: {
            duration: 100,
            type: 'userJourneyStepVital',
          },
          end: 100,
          start: 100,
        },
      );
      expect(analyticsTrackerSpy).toHaveBeenCalledTimes(1);
      expect(analyticsTrackerSpy).toHaveBeenCalledWith({
        attribution: {},
        category: 'user_journey_step',
        metricName: 'load_protect_screen',
        rating: 'good',
        data: 100,
        navigationType : undefined,
        navigatorInformation: {
            deviceMemory: 0,
            hardwareConcurrency: 12,
            isLowEndDevice: false,
            isLowEndExperience: false,
            serviceWorkerStatus: "unsupported",
            }
      });
    })

    it('should run analyticsTracker with duration starting from App launch', async () => { 
        config.analyticsTracker = () => {};
        spy = jest.spyOn(WP, 'mark'); 
        measureSpy = jest.spyOn(WP, 'measure');
        analyticsTrackerSpy = jest.spyOn(config, 'analyticsTracker'); 
         // ============ Mock Data ============
      jest.spyOn(WP, 'getEntriesByName').mockImplementation((name) =>
      name === 'user_journey_mark.loaded_signed_out_splash_screen'
        ? [
            {
              name: 'user_journey_mark.loaded_signed_out_splash_screen',
              entryType: 'mark',
              duration: 0,
              startTime: 0,
              toJSON: jest.fn(),
            },
          ]
        : [],
    );
    jest.spyOn(WP, 'measure').mockImplementationOnce(() => ({
      name: 'user_journey_mark.load_signed_out_splash_screen',
      entryType: 'mark',
      duration: 2000,
      startTime: 0,
      toJSON: jest.fn(),
      detail: ''
    }));
    
    // ========== Mock Data end ==========
    markJourney('loaded_signed_out_splash_screen');
    // we wait for promises to flush since getting the launch time duration is async
    await Promise.resolve();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenLastCalledWith(
      'user_journey_mark.loaded_signed_out_splash_screen',
    );
    expect(measureSpy).toHaveBeenCalledTimes(1);
    expect(analyticsTrackerSpy).toHaveBeenCalledTimes(1);
    expect(analyticsTrackerSpy).toHaveBeenLastCalledWith({
      category: 'user_journey_step',
      metricName: 'load_signed_out_splash_screen',
      rating: 'good',
      data: 2000,
      attribution: {},
      navigationType : undefined,
      navigatorInformation: {
          deviceMemory: 0,
          hardwareConcurrency: 12,
          isLowEndDevice: false,
          isLowEndExperience: false,
          serviceWorkerStatus: "unsupported",
          }
    });
    })
  })

  describe('metric when measures the final step', () => {

    it('should log the entire journey', async () => { 
        config.analyticsTracker = () => {};
        spy = jest.spyOn(WP, 'mark'); 
        analyticsTrackerSpy = jest.spyOn(config, 'analyticsTracker');   
        const measureEntries: Record<string, PerformanceMeasure> = {
            'user_journey_step.load_signed_out_splash_screen': {
              name: 'user_journey_step.load_signed_out_splash_screen',
              entryType: 'measure',
              duration: 2000,
              startTime: 0,
              toJSON: jest.fn(),
              detail: '',
            },
            'user_journey_step.load_import_screen': {
              name: 'user_journey_step.load_import_screen',
              entryType: 'measure',
              duration: 250,
              startTime: 3300,
              toJSON: jest.fn(),
              detail: '',
            },
            'user_journey_step.load_protect_screen': {
              name: 'user_journey_step.load_protect_screen',
              entryType: 'measure',
              duration: 333,
              startTime: 12500,
              toJSON: jest.fn(),
              detail: '',
            },
            'user_journey_step.load_home_screen': {
              name: 'user_journey_step.load_home_screen',
              entryType: 'measure',
              duration: 7777,
              startTime: 38000,
              toJSON: jest.fn(),
              detail: '',
            },
            'user_journey_step.load_home_screen_from_launch': {
              name: 'user_journey_step.load_home_screen_from_launch',
              entryType: 'measure',
              duration: 45000,
              startTime: 0,
              toJSON: jest.fn(),
              detail: '',
            },
          };
          jest.spyOn(WP, 'getEntriesByName').mockImplementation((name) => {
            const entries: Record<string, PerformanceEntry> = {
              'user_journey_mark.loaded_signed_out_splash_screen': {
                name: 'user_journey_mark.loaded_signed_out_splash_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              'user_journey_mark.start_navigate_to_import_screen': {
                name: 'user_journey_mark.start_navigate_to_import_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              'user_journey_mark.loaded_import_screen': {
                name: 'user_journey_mark.loaded_import_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              'user_journey_mark.start_navigate_to_protect_screen': {
                name: 'user_journey_mark.start_navigate_to_protect_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              'user_journey_mark.loaded_protect_screen': {
                name: 'user_journey_mark.loaded_protect_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              'user_journey_mark.start_navigate_to_home_screen': {
                name: 'user_journey_mark.start_navigate_to_home_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              'user_journey_mark.loaded_home_screen': {
                name: 'user_journey_mark.loaded_home_screen',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              'user_journey_mark.loaded_home_screen_from_launch': {
                name: 'user_journey_mark.loaded_home_screen_from_launch',
                entryType: 'mark',
                duration: 0,
                startTime: 100,
                toJSON: jest.fn(),
              },
              ...measureEntries,
            };
            return entries[name] ? [entries[name]] : [];
          });
          jest
          .spyOn(WP, 'measure')
          .mockImplementation((journeyName) => measureEntries[journeyName]  ?? {});
          markJourney('loaded_signed_out_splash_screen');
          // we wait for promises to flush since getting the launch time duration is async
          await Promise.resolve();
          markJourney('start_navigate_to_import_screen');
          expect(spy.mock.calls.length).toBe(2);
          expect(analyticsTrackerSpy).toHaveBeenCalledTimes(1);
          expect(analyticsTrackerSpy).toHaveBeenLastCalledWith({
            attribution: {},
            category: 'user_journey_step',
            metricName: 'load_signed_out_splash_screen',
            rating: 'good',
            data: 2000,
            navigationType : undefined,
            navigatorInformation: {
                deviceMemory: 0,
                hardwareConcurrency: 12,
                isLowEndDevice: false,
                isLowEndExperience: false,
                serviceWorkerStatus: "unsupported",
                }
          });
          markJourney('loaded_import_screen');
          expect(spy.mock.calls.length).toBe(3);
          expect(analyticsTrackerSpy).toHaveBeenCalledTimes(2);
          expect(analyticsTrackerSpy).toHaveBeenLastCalledWith({
            category: 'user_journey_step',
            metricName: 'load_import_screen',
            rating: 'poor',
            data: 250,
            attribution: {},
            navigationType : undefined,
            navigatorInformation: {
                deviceMemory: 0,
                hardwareConcurrency: 12,
                isLowEndDevice: false,
                isLowEndExperience: false,
                serviceWorkerStatus: "unsupported",
                }
          });
          markJourney('start_navigate_to_protect_screen');
          expect(spy.mock.calls.length).toBe(4);
          markJourney('loaded_protect_screen');
          expect(spy.mock.calls.length).toBe(5);
          expect(analyticsTrackerSpy).toHaveBeenCalledTimes(3);
          expect(analyticsTrackerSpy).toHaveBeenLastCalledWith({
            category: 'user_journey_step',
            metricName: 'load_protect_screen',
            rating: 'needsImprovement',
            data: 333,
            attribution: {},
            navigationType : undefined,
            navigatorInformation: {
                deviceMemory: 0,
                hardwareConcurrency: 12,
                isLowEndDevice: false,
                isLowEndExperience: false,
                serviceWorkerStatus: "unsupported",
                }
          });
          markJourney('start_navigate_to_home_screen');
          markJourney('loaded_home_screen');
          expect(spy.mock.calls.length).toBe(7);
          // TODO finish this test
          expect(analyticsTrackerSpy).toHaveBeenCalledTimes(5); //should be 5
          expect(analyticsTrackerSpy).toHaveBeenCalledWith({
            category: 'user_journey',
            name: 'onboarding',
            value: 10360,
          });
    })
   
  })
    // TODO update test once maps work
//   describe('callback markJourney', () => {
//     it('start and finish one single step', () => {
//         config.onMarkJourney = () => {}
//         onMarkJourneySpy = jest.spyOn(config, 'onMarkJourney');
//         // start with the first mark
//         markJourney('start_navigate_to_asset_screen');
        
//         //something is not correct with finding the currently active steps
//         expect(onMarkJourneySpy).toHaveBeenCalledWith('start_navigate_to_asset_screen', [
//           'load_asset_screen_trade_tray',
//         ]);
  
//         markJourney('loaded_asset_screen_trade_tray');
//         // we should receive an empty step array because we finished the step
//         expect(onMarkJourneySpy).toHaveBeenCalledWith('loaded_asset_screen_trade_tray', []);
//       });

//     it('two running steps', () => {
//         config.onMarkJourney = () => {}
//         onMarkJourneySpy = jest.spyOn(config, 'onMarkJourney');
//         // start the first one
//         markJourney('start_navigate_to_asset_screen');
//         expect(onMarkJourneySpy).toHaveBeenCalledWith('start_navigate_to_asset_screen', [
//         'load_asset_screen_trade_tray',
//         ]);

//         // start the second one
//         markJourney('start_navigate_to_buy_preview_screen');
//         expect(onMarkJourneySpy).toHaveBeenCalledWith('start_navigate_to_buy_preview_screen', [
//             'load_asset_screen_trade_tray',
//             'load_buy_order_preview_screen',
//         ]);

//         // close the second one
//         markJourney('loaded_buy_preview_screen');
//         expect(onMarkJourneySpy).toHaveBeenCalledWith('loaded_buy_preview_screen', [
//             'load_asset_screen_trade_tray',
//         ]);

//         // close the first one
//         markJourney('loaded_asset_screen_trade_tray');
//         expect(onMarkJourneySpy).toHaveBeenCalledWith('loaded_asset_screen_trade_tray', []);
//     })  
//   })
});
