import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../api/auth';

jest.mock('../api/auth');
jest.mock('../libs/db');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'worker' },
      accessToken: 'token',
      refreshToken: 'refresh',
    };

    (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login('test@test.com', 'password');
      expect(response.success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockResponse.user);
  });

  it('should handle login failure', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const response = await result.current.login('test@test.com', 'wrong');
      expect(response.success).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
