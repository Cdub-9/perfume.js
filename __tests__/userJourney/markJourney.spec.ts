/**
 * @jest-environment jsdom
 */
import { WP } from '../../src/constants';
import mock from '.././_mock';
import Perfume from '../../src/perfume';
import { markJourney } from '../../src/userJourney/markJourney';
import { userJourneyMap } from '../../src/userJourney/userJourneyMap';

import { testConfig } from '../userJourneyTestConstants';

describe('markJourney', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    (WP as any) = mock.performance();
    const perfume = new Perfume(testConfig);
  });

  afterEach(() => {
    if (spy) {
      spy.mockReset();
      spy.mockRestore();
    }
  });

  describe('markJourney()', () => {
    it('correctly sets the activeSteps maps', () => {
      spy = jest.spyOn(WP, 'mark');
      markJourney('start_navigate_to_second_screen_first_journey');
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenCalledWith(
        'user_journey_mark.start_navigate_to_second_screen_first_journey',
      );
      expect(userJourneyMap.activeSteps).toMatchObject({
        load_second_screen_first_journey: true,
      });
    });

    it('using the markJourneyOnce function should call WP.mark with the journey name', () => {
      spy = jest.spyOn(WP, 'mark');
      markJourney('start_navigate_to_second_screen_first_journey');
      expect(spy.mock.calls.length).toBe(1);
      expect(spy).toHaveBeenCalledWith(
        'user_journey_mark.start_navigate_to_second_screen_first_journey',
      );
    });
  });
});
