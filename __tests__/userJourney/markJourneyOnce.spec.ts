/**
 * @jest-environment jsdom
 */
import { WP } from '../../src/constants';
import mock from '.././_mock';
import Perfume from '../../src/perfume'
import { markJourneyOnce } from '../../src/userJourney';

import { testConfig } from '../../src/constants';

describe('markJourneyOnce', () => {
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
  })

  describe('markJourneyOnce()', () => {
    it('using the markJourneyOnce function should call WP.mark with the journey name', () => {
        jest.spyOn(WP, 'getEntriesByName').mockImplementation(() => []); 
        spy = jest.spyOn(WP, 'mark');       
        markJourneyOnce('start_navigate_to_second_screen');
        expect(spy.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith('user_journey_mark.start_navigate_to_second_screen');
    });
    
  });
});
